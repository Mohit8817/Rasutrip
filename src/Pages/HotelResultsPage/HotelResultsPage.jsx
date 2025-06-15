import React from 'react';
import './HotelResultsPage.css';
import FilterSidebar from '../../Components/Hotel/FilterSidebar';
import SearchSummary from '../../Components/Hotel/SearchSummary';
import SortBar from '../../Components/Hotel/SortBar';
import HotelCard from '../../Components/Hotel/HotelCard';
import Card1 from "../../assest/crd1.jpeg";

const HotelResultsPage = () => {
  const hotels = [
    {
      name: "ELIVAAS 1 BHK with Rooftop Pool - Kamerios Verano",
      location: "Pilerne - Candolim Rd, Saipem Goa India",
      rating: 5,
      price: 3904.49,
      image: Card1,
    },
    {
      name: "ELIVAAS Kamerios Verano 1 BHK with Pool",
      location: "Pilerne - Candolim Rd Marra India",
      rating: 4,
      price: 3936.16,
      image: Card1,
    }
  ];

  return (
    <div className="results-container">
      <SearchSummary />
      <div className="results-content">
        <FilterSidebar />
        <div className="hotel-list-section">
          <SortBar />
          {hotels.map((hotel, index) => (
            <HotelCard key={index} {...hotel} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HotelResultsPage;
