import React from 'react';
import HotelCard from './HotelCard';
import './HotelList.css';
import villa1 from "../../assest/villa1.jpg";
import villa2 from "../../assest/villa2.jpg";
import villa3 from "../../assest/villa3.avif";
import FilterSidebar from "../Filter/FilterSidebar";
// import Footer from '../Footer/Footer';



const hotelData = [
  {
    name: 'Tranquill Riverside Luxury Chalets',
    location: 'Tranquill Riverside Luxury Cottages Goa India',
    rating: 5,
    price: 3792.53,
    tax: 0,
    image: villa1,
  },
  {
    name: 'Elivaas Kamerios Verano 1 Bhk With Pool',
    location: 'Pilerne - Candolim Rd Marra India',
    rating: 4,
    price: 3837.33,
    tax: 0,
    image: villa2,
  },
  {
    name: 'ELIVAAS Kamerios Verano 1 BHK with Pool',
    location: 'Pilerne - Candolim Rd Marra India',
    rating: 4,
    price: 3902.22,
    tax: 0,
    image: villa3,
  }
];

const HotelList = () => {
  return (<>
  <FilterSidebar/>
    <div className="hotel-list-container">
      <h2>Showing Result {hotelData.length} of {hotelData.length} Hotels</h2>
      {hotelData.map((hotel, index) => (
        <HotelCard key={index} hotel={hotel} />
      ))}
    </div>
    </>
  );
};

export default HotelList;
