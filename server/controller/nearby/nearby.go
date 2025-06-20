package nearby
import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"

	"github.com/gin-gonic/gin"
)

type LocationRequest struct {
	Center         []float64 `json:"center"` // [lat, lng]
	RadiusInMeters int       `json:"radiusInMeters"`
}

// Place matches your React Native frontend's Place type
type Place struct {
	ID       int               `json:"id"`
	Type     string            `json:"type"`
	Position []float64         `json:"position"` // [lat, lng]
	Tags     map[string]string `json:"tags"`
	Name     string            `json:"name"`
}

// Overpass API response structure
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

func FetchNearbyPlaces(c *gin.Context) {
	var req LocationRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		log.Println("Error binding JSON:", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request payload",
			"details": err.Error(),
		})
		return
	}

	if len(req.Center) != 2 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Center must contain exactly 2 values (lat, lng)",
		})
		return
	}

	lat := req.Center[0]
	lng := req.Center[1]
	radius := req.RadiusInMeters

	// Build Overpass query
	overpassQuery := fmt.Sprintf(
		`[out:json];(node["amenity"](around:%d,%f,%f);way["amenity"](around:%d,%f,%f););out center;`,
		radius, lat, lng, radius, lat, lng,
	)

	// Call Overpass API
	resp, err := http.Get("https://overpass-api.de/api/interpreter?data=" + url.QueryEscape(overpassQuery))
	if err != nil {
		log.Println("Overpass API error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch places from Overpass API",
		})
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Println("Error reading response body:", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to read API response",
		})
		return
	}

	// Parse Overpass response
	var overpassResp OverpassResponse
	if err := json.Unmarshal(body, &overpassResp); err != nil {
		log.Println("Error parsing JSON:", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to parse API response",
		})
		return
	}

	// Convert to frontend format
	places := make([]Place, 0, len(overpassResp.Elements))
	for _, element := range overpassResp.Elements {
		var position []float64
		if element.Type == "way" && element.Center.Lat != 0 {
			position = []float64{element.Center.Lat, element.Center.Lon}
		} else {
			position = []float64{element.Lat, element.Lon}
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
			ID:       element.ID,
			Type:     element.Type,
			Position: position,
			Tags:     element.Tags,
			Name:     name,
		})
	}
	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   places,
	})
}