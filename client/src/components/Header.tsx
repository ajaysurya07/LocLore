import { useContext, useRef, useState} from "react";
import { searchOnMapRoutes } from "../store/Search";

import type { AppDispatch } from "../store/store";
import { useDispatch} from "react-redux";
import { useData } from "../Context/DataContext";

const Header = () => {

 const [searchTerm, setSearchTerm] = useState("");
 const {globalSearchResults, setGlobalSearchResults , selectedPlace, setSelectedPlace } =  useData();

const dispatch = useDispatch<AppDispatch>();

  const mapRef = useRef<null>(null);

  const searchPlaceGlobally = async (placeName: string): Promise<SearchResult[]> => {
    try {
      dispatch(searchOnMapRoutes(placeName))
        .then((data) => {
          // console.log("searchOnMap data : ", data.payload.results)
          // return data.payload.results;
          setGlobalSearchResults(data.payload.results);
        }
        )

    } catch (error) {
      console.error("error on  searchOnMap : ", error)
    }
  };



  const handleGlobalSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    // const results = 
    await searchPlaceGlobally(searchTerm);
    // setGlobalSearchResults(results);
    // console.log("globalSearchResults : " , globalSearchResults);

    if (globalSearchResults?.length > 0) {
      setSelectedPlace(globalSearchResults[0]);
      if (mapRef.current) {
        mapRef.current.flyTo(globalSearchResults[0].coordinates as LatLngExpression, 15);
      }
    }
  };

  return (
   <main className="top-[0px]">
     <form onSubmit={handleGlobalSearch} className="search-form">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search any place worldwide..."
        />
        <button type="submit">Search</button>
      </form>
            {globalSearchResults?.length > 0 && (
              <div className="search-results">
                {globalSearchResults.map((result, index) => (
                  <div
                    key={index}
                    className={`result-item ${selectedPlace?.name === result.name ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedPlace(result);
                      if (mapRef.current) {
                        mapRef.current.flyTo(result.coordinates as LatLngExpression, 15);
                      }
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <h4>{result.name}</h4>
                    <p>{result.address.city || result.address.state || result.address.country}</p>
                  </div>
                ))}
              </div>
            )}
   </main>
  )
}

export default Header