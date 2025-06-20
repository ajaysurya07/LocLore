import { useState, useEffect, useRef } from "react";
import "./style.css";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Circle,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import axios from "axios";
import { Icon, divIcon, point } from "leaflet";

// create custom icon
const customIcon = new Icon({
  // iconUrl: "https://cdn-icons-png.flaticon.com/512/447/447031.png",
  iconUrl: require("./icons/placeholder.png"),
  iconSize: [38, 38], // size of the icon
});

// custom cluster icon
const createClusterCustomIcon = function (cluster) {
  return new divIcon({
    html: `<span class="cluster-icon">${cluster.getChildCount()}</span>`,
    className: "custom-marker-cluster",
    iconSize: point(33, 33, true),
  });
};

const CenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

export default function App() {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [radius, setRadius] = useState(1000);
  const [searchTerm, setSearchTerm] = useState("");
  const [globalSearchResults, setGlobalSearchResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const mapRef = useRef();

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }
    console.log("started ");
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userPos = [pos.coords.latitude, pos.coords.longitude];
        setPosition(userPos);
        fetchNearbyPlaces(userPos, radius);
        setLoading(false);
        console.log("pos : ", position);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
        const defaultPos = [48.8566, 2.3522];
        setPosition(defaultPos);
        fetchNearbyPlaces(defaultPos, radius);
      }
    );
  }, []);

  // fun to fetch nearby places using Overpass API
  const fetchNearbyPlaces = async (center, radiusInMeters) => {
    try {
      const [lat, lng] = center;
      const overpassQuery = `[out:json];(node["amenity"](around:${radiusInMeters},${lat},${lng});way["amenity"](around:${radiusInMeters},${lat},${lng}););out center;`;

      const response = await axios.get(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
          overpassQuery
        )}`
      );

      const places = response.data.elements.map((element) => ({
        id: element.id,
        type: element.type,
        position: element.center
          ? [element.center.lat, element.center.lon]
          : [element.lat, element.lon],
        tags: element.tags || {},
        name:
          element.tags?.name || `Unnamed ${element.tags?.amenity || "place"}`,
      }));

      setNearbyPlaces(places);
    } catch (err) {
      console.error("Failed to fetch nearby places:", err);
      setError("Failed to load nearby places");
    }
  };

  const searchPlaceGlobally = async (placeName) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          placeName
        )}&limit=10`
      );

      return response.data.map((place) => ({
        name: place.display_name,
        coordinates: [parseFloat(place.lat), parseFloat(place.lon)],
        type: place.type,
        address: {
          city: place.address?.city,
          state: place.address?.state,
          country: place.address?.country,
        },
      }));
    } catch (error) {
      console.error("Global search error:", error);
      return [];
    }
  };

  const handleGlobalSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const results = await searchPlaceGlobally(searchTerm);
    setGlobalSearchResults(results);

    if (results.length > 0) {
      setSelectedPlace(results[0]);
      if (mapRef.current) {
        mapRef.current.flyTo(results[0].coordinates, 15);
      }
    }
  };
  useEffect(() => {
    console.log("near places : ", nearbyPlaces);
  }, [nearbyPlaces]);

  useEffect(() => {
    if (selectedPlace) {
      console.log("Selected place:", selectedPlace);
      setPosition(selectedPlace.coordinates);
      fetchNearbyPlaces(selectedPlace.coordinates, radius);
    }
  }, [selectedPlace]);

  if (loading) {
    return <div className="loading">Loading your location...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <>
      <form onSubmit={handleGlobalSearch} className="search-form">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search any place worldwide..."
        />
        <button type="submit">Search</button>
      </form>

      {globalSearchResults.length > 0 && (
        <div className="search-results">
          {globalSearchResults.map((result, index) => (
            <div 
            currsor="pointer"
              key={index}
              className={`result-item ${selectedPlace?.name === result.name ? 'active' : ''}`}
              onClick={() => {
                setSelectedPlace(result);
                if (mapRef.current) {
                  mapRef.current.flyTo(result.coordinates, 15);
                }
              }}
            >
              <h4>{result.name}</h4>
              <p>{result.address.city || result.address.state || result.address.country}</p>
            </div>
          ))}
        </div>
      )}

      <MapContainer 
        center={position} 
        zoom={15} 
        style={{ height: "100vh" }}
        whenCreated={(map) => { mapRef.current = map; }}
      >
        <TileLayer
          attribution="Google Maps"
          url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          subdomains={["mt0", "mt1", "mt2", "mt3"]}
        />

        <CenterMap center={selectedPlace?.coordinates || position} />

        {position && (
          <>
            <Marker position={position} icon={customIcon}>
              <Popup>You are here!</Popup>
            </Marker>
            <Circle
              center={position}
              radius={radius}
              pathOptions={{
                color: "blue",
                fillColor: "#30f",
                fillOpacity: 0.2
              }}
            >
              <Popup>Search radius: {radius}m</Popup>
            </Circle>
          </>
        )}

        {selectedPlace && (
          <Marker position={selectedPlace.coordinates} icon={customIcon}>
            <Popup>
              <div>
                <h3>{selectedPlace.name}</h3>
                <p>Coordinates: {selectedPlace.coordinates.join(', ')}</p>
              </div>
            </Popup>
          </Marker>
        )}

        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createClusterCustomIcon}
        >
          {nearbyPlaces.map((place) => (
            <Marker 
              key={`${place.type}-${place.id}`} 
              position={place.position} 
              icon={customIcon}
            >
              <Popup>
                <div>
                  <h3>{place.name}</h3>
                  <p>Type: {place.tags.amenity || "unknown"}</p>
                  {place.tags.cuisine && <p>Cuisine: {place.tags.cuisine}</p>}
                  {place.tags.opening_hours && (
                    <p>Hours: {place.tags.opening_hours}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </>
  );
}
