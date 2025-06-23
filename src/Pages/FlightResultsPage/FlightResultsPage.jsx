// FlightResultsPage.js
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import FlightSearchBar from '../../Components/FlightOneWay/FlightSearchBar';
import FlightSidebar from '../../Components/FlightOneWay/FlightSidebar';
import FlightList from '../../Components/FlightOneWay/FlightList';
import RoundsearchBar from '../../Components/FlightRoundTrip.jsx/RoundsearchBar';
import RoundTripCardList from '../../Components/FlightRoundTrip.jsx/RoundTripCardList';

const FlightResultsPage = () => {
     const { state } = useLocation();
  const tripType = state?.tripType || 'oneway';


    return (
        <div>
            {/* One-way Flights */}
            {tripType === 'oneway' && (
                <Container className="mt-5 pt-5">
                    <Row>
                        <Col>
                            <FlightSearchBar />
                        </Col>
                    </Row>
                    <Row className="mt-4">
                        <Col lg={3}>
                            <FlightSidebar />
                        </Col>
                        <Col lg={9}>
                            <FlightList/>
                        </Col>
                    </Row>
                </Container>
            )}

            {/* Round Trip Flights */}
            {tripType === 'roundtrip' && (
                <Container className="mt-5 pt-5">
                    <Row>
                        <Col>
                            <RoundsearchBar />
                        </Col>
                    </Row>
                    <Row className="mt-4">
                        <Col lg={3}>
                            <FlightSidebar />
                        </Col>
                        <Col lg={9}>
                            <RoundTripCardList />
                        </Col>
                    </Row>
                </Container>
            )}
        </div>
    );
};

export default FlightResultsPage;
