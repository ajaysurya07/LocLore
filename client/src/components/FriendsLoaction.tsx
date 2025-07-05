import { useEffect, useMemo, useState } from 'react'
import { Marker, Popup } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { useData } from '../Context/DataContext';
import { GetFriendsId } from "../store/Friends";
import type { AppDispatch } from '../store/store';
import { useDispatch } from 'react-redux';
import getFriendsLocations from "../firebase/getFriendsLocations";

interface FriendLocation {
    id: string;
    position: number[];
}



const FriendsLoaction = ({ userDetails }: any) => {

    const { customIcon, customFriendIcon, createClusterCustomIcon } = useData();

    const [friendsIDs, setFriendsIDs] = useState<string[]>([]);

    const [friendLocation, setFriendLocation] = useState<FriendLocation[]>([]);

    const dispatch = useDispatch<AppDispatch>();


    useEffect(() => {
        if (!userDetails?.userId) return;
        dispatch(GetFriendsId({
            userID: userDetails?.userId
        })).then(data => {
            setFriendsIDs(data.payload.friendsID);
            console.log("setFriendsLoc : ", data.payload.friendsID);
        }).catch(err => { console.error("error on dis GetFriendsId : ", err); })

    }, [userDetails?.userId]);


    useEffect(() => {
        const fetchFriendsLocations = async () => {
            if (!friendsIDs || friendsIDs.length === 0) return;

            console.log("friends ID:", friendsIDs);
            const res = await getFriendsLocations(friendsIDs);
            setFriendLocation(res);
            console.log("res for getFriendsLocations:", res);
        };

        fetchFriendsLocations();
    }, [friendsIDs]);

    const friendMarkers = useMemo(() => {
        return friendLocation.map((place) => {
            if (!Array.isArray(place.position) || place.position.length !== 2) return null;

            return (
                <Marker
                    key={place.id}
                    position={place.position}
                    icon={customIcon}
                >
                    <Popup>
                        <div>
                            <h3>{place.id}</h3>
                        </div>
                    </Popup>
                </Marker>
            );
        });
    }, [friendLocation, customFriendIcon, customIcon]);



    return (
        <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={createClusterCustomIcon}
        >
            {friendMarkers}
        </MarkerClusterGroup>

    )
}

export default FriendsLoaction