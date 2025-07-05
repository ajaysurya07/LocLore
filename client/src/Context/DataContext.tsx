import React, { createContext, useContext, useState, ReactNode } from "react";
import iconUrl from "../icons/placeholder.png";
import frriendsIcon from "../icons/friendsLoc.png"

import { Icon , divIcon , point   } from "leaflet";



const customIcon = new Icon({
  iconUrl,
  iconSize: [38, 38],
});

const customFriendIcon = new Icon({
 frriendsIcon ,  
  iconSize: [38, 38],
});


interface Cluster {
    getChildCount: () => number;
}

interface User {
    userId: string;
    username: string;
    displayname: string;
}

interface Position {
    lat: number;
    lng: number;
}

interface SearchResult {
    name: string;
    coordinates: Position;
    type: string;
    address: {
        city?: string;
        state?: string;
        country?: string;
    };
}

interface DataContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    globalSearchResults: SearchResult[];
    setGlobalSearchResults: (results: SearchResult[]) => void;
    selectedPlace: SearchResult | null;
    setSelectedPlace: (place: SearchResult | null) => void;
    customFriendIcon :  any ;
    customIcon : any ;
    createClusterCustomIcon : any
 }

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [globalSearchResults, setGlobalSearchResults] = useState<SearchResult[]>([]);
    const [selectedPlace, setSelectedPlace] = useState<SearchResult | null>(null);

const createClusterCustomIcon = function (cluster: Cluster) {
    return new divIcon({
        html: `<span class="cluster-icon">${cluster.getChildCount()}</span>`,
        className: "custom-marker-cluster",
        iconSize: point(33, 33, true),
    });
};


    return (
        <DataContext.Provider 
            value={{ 
                user, 
                setUser, 
                globalSearchResults, 
                setGlobalSearchResults, 
                selectedPlace, 
                setSelectedPlace ,
                customFriendIcon ,
                customIcon ,  
                createClusterCustomIcon,
            }}
        >
            {children}
        </DataContext.Provider>
    );
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error("useData must be used within a DataProvider");
    }
    return context;
};