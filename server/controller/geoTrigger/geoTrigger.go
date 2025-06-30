package geoTrigger 

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type GeoTrigger struct {
	ID            int       `json:"id"`
	UserID        int       `json:"user_id"`
	Name          string    `json:"name"`
	Category      string    `json:"category"`
	Latitude      float64   `json:"latitude"`
	Longitude     float64   `json:"longitude"`
	TriggerRadius int       `json:"trigger_radius"`
	IsActive      bool      `json:"is_active"`
	IsTriggered   bool      `json:"is_triggered"`
	CreatedAt     time.Time `json:"created_at"`
	TriggeredAt   time.Time `json:"triggered_at"`
}

type Place struct {
	ID       int               `json:"id"`
	Type     string            `json:"type"`
	Lat      float64           `json:"lat"`
	Lon      float64           `json:"lon"`
	Tags     map[string]string `json:"tags"`
	Name     string            `json:"name"`
}

type OverpassResponse struct {
	Elements []struct {
		ID    int               `json:"id"`
		Type  string            `json:"type"`
		Lat   float64           `json:"lat,omitempty"`
		Lon   float64           `json:"lon,omitempty"`
		Center struct {
			Lat float64 `json:"lat"`
			Lon float64 `json:"lon"`
		} `json:"center,omitempty"`
		Tags map[string]string `json:"tags"`
	} `json:"elements"`
}

type ReminderChecker struct {
	db *pgxpool.Pool
}

func NewReminderChecker(db *pgxpool.Pool) *ReminderChecker {
	return &ReminderChecker{db: db}
}

func (rc *ReminderChecker) getActiveReminders(ctx context.Context, userID int) ([]GeoTrigger, error) {
	query := `
		SELECT id, user_id, name, category, 
			   trigger_radius, is_active, is_triggered
		FROM geo_triggers
		WHERE user_id = $1 AND is_active = true AND is_triggered = false
	`

	rows, err := rc.db.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var reminders []GeoTrigger
	for rows.Next() {
		var r GeoTrigger
		err := rows.Scan(
			&r.ID, &r.UserID, &r.Name, &r.Category,
			&r.TriggerRadius, &r.IsActive, &r.IsTriggered,
		)
		if err != nil {
			return nil, err
		}
		reminders = append(reminders, r)
	}

	return reminders, nil
}

func (rc *ReminderChecker) fetchNearbyPlaces(ctx context.Context, lat, lng float64, radius int) ([]Place, error) {
	overpassQuery := fmt.Sprintf(
		`[out:json];(node["amenity"](around:%d,%f,%f);way["amenity"](around:%d,%f,%f););out center;`,
		radius, lat, lng, radius, lat, lng,
	)

	resp, err := http.Get("https://overpass-api.de/api/interpreter?data=" + url.QueryEscape(overpassQuery))
	if err != nil {
		return nil, fmt.Errorf("Overpass API error: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error reading response body: %w", err)
	}

	var overpassResp OverpassResponse
	if err := json.Unmarshal(body, &overpassResp); err != nil {
		return nil, fmt.Errorf("error parsing JSON: %w", err)
	}

	places := make([]Place, 0, len(overpassResp.Elements))
	for _, element := range overpassResp.Elements {
		var lat, lon float64
		if element.Type == "way" && element.Center.Lat != 0 {
			lat = element.Center.Lat
			lon = element.Center.Lon
		} else {
			lat = element.Lat
			lon = element.Lon
		}

		name := element.Tags["name"]
		if name == "" {
			amenity := element.Tags["amenity"]
			if amenity == "" {
				amenity = "place"
			}
			name = fmt.Sprintf("Unnamed %s", amenity)
		}

		places = append(places, Place{
			ID:   element.ID,
			Type: element.Type,
			Lat:  lat,
			Lon:  lon,
			Tags: element.Tags,
			Name: name,
		})
	}

	return places, nil
}

func (rc *ReminderChecker) matchesReminder(reminder GeoTrigger, place Place) bool {
	lowerReminder := strings.ToLower(reminder.Name)
	lowerPlaceName := strings.ToLower(place.Name)

	if strings.Contains(lowerPlaceName, lowerReminder) {
		return true
	}

	for _, tagValue := range place.Tags {
		if strings.Contains(strings.ToLower(tagValue), lowerReminder) {
			return true
		}
	}

	return false
}

func (rc *ReminderChecker) markTriggered(ctx context.Context, reminderID int) error {
	_, err := rc.db.Exec(ctx,
		"UPDATE geo_triggers SET is_triggered = true, triggered_at = $1 WHERE id = $2",
		time.Now(), reminderID,
	)
	return err
}

func (rc *ReminderChecker) sendNotification(ctx context.Context, userID int, reminder GeoTrigger) error {
	message := "Reminder: " + reminder.Name + " is nearby!"
	log.Printf("Sending notification to user %d: %s", userID, message)
	// Implement actual notification logic here
	return nil
}

func (rc *ReminderChecker) CheckActiveReminders(ctx context.Context, userID int, lat, lng float64) error {
	reminders, err := rc.getActiveReminders(ctx, userID)
	if err != nil {
		return fmt.Errorf("error getting active reminders: %w", err)
	}

	for _, reminder := range reminders {
		places, err := rc.fetchNearbyPlaces(ctx, lat, lng, reminder.TriggerRadius)
		if err != nil {
			log.Printf("Error fetching places: %v", err)
			continue
		}

		for _, place := range places {
			if rc.matchesReminder(reminder, place) {
				if err := rc.sendNotification(ctx, userID, reminder); err != nil {
					log.Printf("Error sending notification: %v", err)
					continue
				}

				if err := rc.markTriggered(ctx, reminder.ID); err != nil {
					log.Printf("Error marking reminder triggered: %v", err)
				}
				break
			}
		}
	}

	return nil
}