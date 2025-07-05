import React, { useEffect, useState } from 'react'
import { MapContainer, Marker, Popup } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { useData } from '../Context/DataContext';
import type { RootState } from '@reduxjs/toolkit/query';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNearbyPlaces } from "../store/Home";
import type { AppDispatch } from '../store/store';

type Position = [number, number];

interface Place {
    id: number;
    type: string;
    position: Position;
    tags: {
        [key: string]: string;
        name: string;
        amenity: string;
        cuisine: string;
        opening_hours: string;
    };
    name: string;
}


const NearPlaces = ({ position  }: any) => {

    const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
    const { isLoading, places } = useSelector((state: RootState) => state.nearPlaces)

    const { customIcon, createClusterCustomIcon } = useData();

    const dispatch = useDispatch<AppDispatch>();


    useEffect(() => {
        const payload = {
            center: position, radiusInMeters: 1000
        }

        dispatch(fetchNearbyPlaces(payload))
    }, [position]);


    // if (isLoading) return;

    useEffect(() => {
        if (places.length !== 0)
            setNearbyPlaces(places);
        console.log("near places : ", places);
    }, [places])


    return (

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
    )
}

export default NearPlaces