import React, { useEffect, useState } from "react";
import HotelCard from "./HotelCard";

const HotelList = ({
  masterHotelList, // Receive master hotel list as prop (similar to BusDetailsList)
  priceRange,
  selectedRatings,
  searchName,
}) => {
  const [filteredHotels, setFilteredHotels] = useState([]);

  // Apply filters when any of them change (similar to BusDetailsList)
  useEffect(() => {
    if (!masterHotelList.length) {
      setFilteredHotels([]);
      return;
    }

    const filtered = masterHotelList.filter((hotel) => {
      const inPriceRange =
        hotel.price >= priceRange[0] && hotel.price <= priceRange[1];

      const inRatingRange =
        selectedRatings.length === 0 ||
        selectedRatings.includes(Math.round(hotel.rating));

      const matchesName =
        !searchName ||
        hotel.name.toLowerCase().includes(searchName.toLowerCase());

      return inPriceRange && inRatingRange && matchesName;
    });

    setFilteredHotels(filtered);
  }, [priceRange, selectedRatings, searchName, masterHotelList]);

  // If no hotels match the filters (but hotels exist in master list)
  if (masterHotelList.length > 0 && filteredHotels.length === 0) {
    return (
      <div className="text-center p-5">
        <i className="fas fa-filter fa-3x text-muted mb-3"></i>
        <h5 className="text-muted">No hotels found with selected filters</h5>
        <p className="text-muted">Please adjust your filters and try again.</p>
      </div>
    );
  }

  return (
    <div className="hotel-list">
      {filteredHotels.map((hotel, index) => (
        <HotelCard key={`${hotel.id}-${index}`} hotel={hotel} />
      ))}
    </div>
  );
};

export default HotelList;
