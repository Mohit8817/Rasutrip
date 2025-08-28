import React from 'react'
import { Container, Row, Col } from 'react-bootstrap';
import BookingSteps from '../FlightDetails/BookingSteps';
import FareSummary from '../FlightDetails/FareSummary';
import PromoCodeBox from '../FlightDetails/PromoCodeBox';
import Paymentinfo from './Paymentinfo';
import { useLocation, useNavigate } from "react-router-dom";


import '../../Style/Pagescss/FlightResultsPage.css';


const FlightPayment = () => {
    const location = useLocation();

    const {
        passengerSelections = [],
        onwardPassengerSelections = [],
        returnPassengerSelections = [],
        SSR,
        ReturnSSR,
        SelectedFare,
        isRoundtrip = false,
        isRoundTrip = false, // Sometimes it comes as different names
        passengersData = [],
        ReturnData
    } = location.state || {};

    return (
        <div>
            <div>
                <Container style={{ marginTop: '10rem' }}>

                    <Row>
                        <div>
                            <BookingSteps activeIndex={4} />
                        </div>
                    </Row>
                    <Row>
                        <Col lg={9}>
                            <div >

                                <Paymentinfo />

                            </div>

                        </Col>
                        <Col lg={3}>
                            <div>
                                <FareSummary
                                    Faresummary={"Faresummary"}
                                    passengerSelections={passengerSelections}
                                    onwardPassengerSelections={passengerSelections.onward || passengerSelections}
                                    returnPassengerSelections={returnPassengerSelections}
                                    isRoundtrip={isRoundTrip}
                                />
                                <PromoCodeBox />

                            </div>
                        </Col>
                    </Row>
                </Container>
            </div></div>
    )
}

export default FlightPayment