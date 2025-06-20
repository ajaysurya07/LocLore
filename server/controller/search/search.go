package search

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"strconv"

	"github.com/gin-gonic/gin"
)

type SearchResult struct {
	Name        string    `json:"name"`
	Coordinates []float64 `json:"coordinates"`
	Type        string    `json:"type"`
	Address     struct {
		City    string `json:"city,omitempty"`
		State   string `json:"state,omitempty"`
		Country string `json:"country,omitempty"`
	} `json:"address"`
}

func FetchSearchPlaceGlobally(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Query parameter 'q' is required",
		})
		return
	}

	log.Printf("Search request received: %s\n", query)

	// Build Nominatim API URL with proper encoding
	baseURL := "https://nominatim.openstreetmap.org/search"
	params := url.Values{}
	params.Add("format", "json")
	params.Add("q", query)
	params.Add("limit", "10")
	params.Add("addressdetails", "1")

	fullURL := fmt.Sprintf("%s?%s", baseURL, params.Encode())

	// Create HTTP client with custom headers
	client := &http.Client{}
	req, err := http.NewRequest("GET", fullURL, nil)
	if err != nil {
		log.Println("Error creating request:", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create search request",
		})
		return
	}

	// Set required headers for Nominatim
	req.Header.Add("User-Agent", "LocLoreApp/1.0")
	req.Header.Add("Accept-Language", "en-US,en;q=0.9")

	// Make the request
	resp, err := client.Do(req)
	if err != nil {
		log.Println("Nominatim API error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch places from Nominatim API",
		})
		return
	}
	defer resp.Body.Close()

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Println("Error reading response body:", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to read API response",
		})
		return
	}

	// Parse Nominatim response
	var nominatimResults []struct {
		DisplayName string                 `json:"display_name"`
		Lat         string                 `json:"lat"`
		Lon         string                 `json:"lon"`
		Type        string                 `json:"type"`
		Address     map[string]interface{} `json:"address"`
	}

	if err := json.Unmarshal(body, &nominatimResults); err != nil {
		log.Println("Error parsing JSON:", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to parse API response",
		})
		return
	}

	// Convert to our response format
	results := make([]SearchResult, 0, len(nominatimResults))
	for _, place := range nominatimResults {
		lat, _ := strconv.ParseFloat(place.Lat, 64)
		lon, _ := strconv.ParseFloat(place.Lon, 64)

		result := SearchResult{
			Name:        place.DisplayName,
			Coordinates: []float64{lat, lon},
			Type:        place.Type,
		}

		// Extract address components
		if addr, ok := place.Address["city"]; ok {
			result.Address.City = addr.(string)
		}
		if addr, ok := place.Address["state"]; ok {
			result.Address.State = addr.(string)
		}
		if addr, ok := place.Address["country"]; ok {
			result.Address.Country = addr.(string)
		}

		results = append(results, result)
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"results": results,
	})
}