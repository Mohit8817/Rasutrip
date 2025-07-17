import React, { useContext } from 'react'
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

    return (
        <div>
            

                            <Addoninfo />
                       
        </div>
    )
}

export default FlightAddon