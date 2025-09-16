import React, { useContext,useEffect } from 'react'
import { Container, Row, Col } from 'react-bootstrap';
import BookingSteps from '../FlightDetails/BookingSteps';
import FareSummary from '../FlightDetails/FareSummary';
import PromoCodeBox from '../FlightDetails/PromoCodeBox';


import '../../Style/Pagescss/FlightResultsPage.css';
import Addoninfo from './Addoninfo';
import { LocationContext } from '../Context/LocationContext';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';


const FlightAddon = () => {
 const location = useLocation();
 useEffect(() => {
  if (!document.cookie.includes("hasReloaded=true")) {
    document.cookie = "hasReloaded=true; path=/; max-age=5"; // expires in 5s
    window.location.reload();
  }
}, []);
    return (
        <div>
            

                            <Addoninfo />
                       
        </div>
    )
}

export default FlightAddon