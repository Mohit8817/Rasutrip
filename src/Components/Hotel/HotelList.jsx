import React from "react";
import HotelCard from "./HotelCard";
import "./HotelList.css";

const hotels = [
  {
    name: "Tranquill Riverside Luxury Chalets",
    location: "Tranquill Riverside Luxury Cottages Goa India",
    rating: 5,
    price: 4422.66,
    image: "https://via.placeholder.com/150"
  },
  {
    name: "ELIVAAS Kamerios Brisa 1BHK with Jacuzzi",
    location: "Pilerne - Candolim Rd Marra India",
    rating: 4,
    price: 5487.10,
    image: "https://via.placeholder.com/150"
  },
  {
    name: "ELIVAAS Kamerios Maris 1 BHK Jacuzzi",
    location: "Keshva Kamerios, near Hilton Goa Resort Marra India",
    rating: 4,
    price: 8254.23,
    image: "https://via.placeholder.com/150"
  }
];

const HotelList = () => {
  return (
    <div className="hotel-list">
      <h2>Showing Result {hotels.length} of {hotels.length} Hotels</h2>
      {hotels.map((hotel, index) => (
        <HotelCard hotel={hotel} key={index} />
      ))}
    </div>
  );
};

export default HotelList;