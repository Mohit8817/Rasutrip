import React, { useState, useEffect, useRef, useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../Style/HotelSearchForm.css";
import { fetchHotelCities } from "../APIS/HotelApi/HotelAPi";
import { HotelSearchContext } from "../Context/HotelSearchContext";

const CitySelector = () => {
  const [query, setQuery] = useState("");
  const [selectedValue, setSelectedValue] = useState("");
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  // ✅ Access the context
  const { hotelSearchData, setHotelSearchData } =
    useContext(HotelSearchContext);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.length > 1) {
        getCities(query);
      } else {
        setCitySuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  const getCities = async (inputValue) => {
    const results = await fetchHotelCities(inputValue);
    setCitySuggestions(results);
    setShowSuggestions(true);
  };

  const handleSelectCity = (city) => {
    const fullValue = `${city.destination}, ${city.country}`;
    setQuery(fullValue); // show in input
    setSelectedValue(fullValue);
    setShowSuggestions(false);

    // ✅ Save selected city in context
    setHotelSearchData((prev) => ({
      ...prev,
      city: fullValue,
    }));
  };

  // close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="container">
      <div className="rounded-3 w-100">
        <div className="city_box position-relative" ref={wrapperRef}>
          <label className="City_label">CITY</label>
          <input
            type="text"
            className="form-control border-0 fw-bold city-input"
            placeholder="Search city e.g. Delhi, India"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (citySuggestions.length > 0) setShowSuggestions(true);
            }}
          />

          {showSuggestions && citySuggestions.length > 0 && (
            <div className="dropdown-list">
              {citySuggestions.map((city) => (
                <div
                  key={city._id}
                  className="dropdown-item"
                  onClick={() => handleSelectCity(city)}
                >
                  {city.destination}, {city.country}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CitySelector;
