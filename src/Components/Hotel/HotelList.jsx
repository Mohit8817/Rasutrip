import React from "react";
import HotelCard from "./HotelCard";
import "./HotelListingPage.css";

import img1 from "../../assest/hotel1.jpg";

const hotels = [
  {
    name: "Tranquill Riverside Luxury Chalets",
    location: "Tranquill Riverside Luxury Cottages Goa India",
    rating: 5,
    price: 4422.66,
    image: img1,
  },
  {
    name: "ELIVAAS Kamerios Brisa 1BHK with Jacuzzi",
    location: "Pilerne - Candolim Rd Marra India",
    rating: 4,
    price: 5487.10,
    image: img1,
  },
  {
    name: "ELIVAAS Kamerios Maris 1 BHK Jacuzzi",
    location: "Keshva Kamerios, near Hilton Goa Resort Marra India",
    rating: 4,
    price: 8254.23,
    image: img1,
  }
];

const HotelList = () => {
  return (
    <div className="hotel-list">
      {hotels.map((hotel, index) => (
        <HotelCard hotel={hotel} key={index} />
      ))}
    </div>
  );
};

export default HotelList;