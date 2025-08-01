import React, { useContext } from 'react'
import { Container, Row, Col } from 'react-bootstrap';
import BookingSteps from '../FlightDetails/BookingSteps';
import FareSummary from '../FlightDetails/FareSummary';
import PromoCodeBox from '../FlightDetails/PromoCodeBox';
import TravellerInfo from './TravellerInfo';

import '../../Style/Pagescss/FlightResultsPage.css';
import { useLocation } from 'react-router-dom';
import { LocationContext } from '../Context/LocationContext';


const FlightTravellerDetails = () => {
    const location = useLocation();
    const { locationData, setLocationData } = useContext(LocationContext);
    const { SelectedFare, fareConfirm } = location?.state || {}
    return (
        <div>
            <Container style={{ marginTop: '10rem' }}>

                <Row>
                    <div>
                        <BookingSteps activeIndex={1} />
                    </div>
                </Row>
                <Row>
                    <Col lg={9}>
                        <div >
                            <TravellerInfo SelectedFare={SelectedFare} fareConfirm={fareConfirm} />
                        </div>

                    </Col>
                    <Col lg={3}>
                        <div>
                            <FareSummary SelectedFare={SelectedFare} />
                            <PromoCodeBox />

                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default FlightTravellerDetails