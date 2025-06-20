import React, { createContext, useContext, useState, ReactNode } from "react";

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
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [globalSearchResults, setGlobalSearchResults] = useState<SearchResult[]>([]);
    const [selectedPlace, setSelectedPlace] = useState<SearchResult | null>(null);

    return (
        <DataContext.Provider 
            value={{ 
                user, 
                setUser, 
                globalSearchResults, 
                setGlobalSearchResults, 
                selectedPlace, 
                setSelectedPlace 
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