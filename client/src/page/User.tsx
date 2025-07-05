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



import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch } from "../store/store";
import type { RootState } from "@reduxjs/toolkit/query";
import { useData } from "../Context/DataContext";
import { SetupGeoTrigger } from "../store/GeoTrigger";

import connectFireBase from "../firebase/connectFireBase";
import FriendsLoaction from "../components/FriendsLoaction";
import NearPlaces from "../components/NearPlaces";


// Types for our data structures
type Position = [number, number];




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

const User = ({ userDetails }: any) => {





    const [position, setPosition] = useState<Position>([0, 0]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [radius, setRadius] = useState(1000);



    const { globalSearchResults, setGlobalSearchResults, selectedPlace, setSelectedPlace, customFriendIcon,
        customIcon, } = useData();

    const mapRef = useRef<null>(null);


    const dispatch = useDispatch<AppDispatch>();





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
                setLoading(false);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
                const defaultPos: Position = [48.8566, 2.3522];
                setPosition(defaultPos);
                const payload = {
                    center: defaultPos, radiusInMeters: radius
                }
            }
        );
    }, []);

    useEffect(() => {
        if (!userDetails?.userId) return;
        connectFireBase(userDetails.userId, position[0], position[1]);
    }, [userDetails])

    useEffect(() => {

        if (!userDetails?.userId) return;

        const payload: any = {

            userID: userDetails.userId,
            lat: position[0],
            lng: position[1],

        }
        const response = dispatch(SetupGeoTrigger(payload));
        console.log(" SetupGeoTrigger response  : ", response);
    }, [position])



    useEffect(() => {
        if (selectedPlace) {
            console.log("Selected place:", selectedPlace);
            setPosition(selectedPlace.coordinates);
        }
    }, [selectedPlace]);



    if (loading || loading) {
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
                <FriendsLoaction
                    userDetails={userDetails}
                />
                <NearPlaces
                    position={position}
                />
            </MapContainer>

        </>
    );
}

export default User