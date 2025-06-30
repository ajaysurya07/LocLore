import { useState, useEffect, useRef, useContext } from "react";
import "./Home.css";
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
// import axios from "axios";
import { Icon, divIcon, point, LatLngExpression } from "leaflet";

import iconUrl from "../icons/placeholder.png";
import { useDispatch, useSelector } from "react-redux";
import { fetchNearbyPlaces } from "../store/Home";
import type { AppDispatch } from "../store/store";
import type { RootState } from "@reduxjs/toolkit/query";
import { useData } from "../Context/DataContext";
import axios from "axios";
import { SetupGeoTrigger } from "../store/GeoTrigger";


// Types for our data structures
type Position = [number, number];

interface Place {
  id: number;
  type: string;
  position: Position;
  tags: {
    [key: string]: string;
    name?: string;
    amenity?: string;
    cuisine?: string;
    opening_hours?: string;
  };
  name: string;
}


interface Cluster {
  getChildCount: () => number;
}


const customIcon = new Icon({
  iconUrl,
  iconSize: [38, 38],
});


const createClusterCustomIcon = function (cluster: Cluster) {
  return new divIcon({
    html: `<span class="cluster-icon">${cluster.getChildCount()}</span>`,
    className: "custom-marker-cluster",
    iconSize: point(33, 33, true),
  });
};

interface CenterMapProps {
  center: Position;
}

const CenterMap = ({ center }: CenterMapProps) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const Home = () => {
  const [position, setPosition] = useState<Position>([0, 0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const [radius, setRadius] = useState(1000);

  const { globalSearchResults, setGlobalSearchResults, selectedPlace, setSelectedPlace } = useData();

  const mapRef = useRef<null>(null);


  const dispatch = useDispatch<AppDispatch>();

  const { isLoading, places } = useSelector((state: RootState) => state.nearPlaces)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userPos: Position = [pos.coords.latitude, pos.coords.longitude];
        setPosition(userPos);
        const payload = {
          center: userPos, radiusInMeters: radius
        }
        dispatch(fetchNearbyPlaces(payload))
        setLoading(false);
        console.log("pos : ", position);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
        const defaultPos: Position = [48.8566, 2.3522];
        setPosition(defaultPos);
        const payload = {
          center: defaultPos, radiusInMeters: radius
        }
        dispatch(fetchNearbyPlaces(payload))
      }
    );
  }, []);

  useEffect(()=>{
   const payload : any  = {

        userID : "106122007",
        lat : position[0] ,
        lng : position[1],
        
   } 
      const response = dispatch(SetupGeoTrigger(payload));
      console.log(" SetupGeoTrigger response  : " , response );
  } , [position])

  useEffect(() => {
    if (selectedPlace) {
      console.log("Selected place:", selectedPlace);
      setPosition(selectedPlace.coordinates);
      const payload = {
        center: selectedPlace.coordinates, radiusInMeters: radius
      }
      dispatch(fetchNearbyPlaces(payload))
    }
  }, [selectedPlace]);

  useEffect(() => {
    if (places.length !== 0)
      setNearbyPlaces(places);
  }, [places])

  if (loading || isLoading) {
    return <div className="loading">Loading your location...</div>;
  }

  return (
    <>
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

export default Home;