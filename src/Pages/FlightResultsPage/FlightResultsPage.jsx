import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import FlightSearchBar from '../../Components/FlightOneWay/FlightSearchBar';
import FlightSidebar from '../../Components/FlightOneWay/FlightSidebar';
import FlightList from '../../Components/FlightOneWay/FlightList';
import RoundsearchBar from '../../Components/FlightRoundTrip.jsx/RoundsearchBar';
import RoundTripCardList from '../../Components/FlightRoundTrip.jsx/RoundTripCardList';
import RoundTripBookingBar from '../../Components/FlightRoundTrip.jsx/RoundTripBookingBar';
import { useDispatch } from 'react-redux';
import { clearSelectedFlights } from '../../redux/Slices/SelectedFlight';
import FlightLoader from '../../Components/FlightLoader/FlightLoader';

const FlightResultsPage = () => {
    const dispatch = useDispatch();
    const { state } = useLocation();
    const tripType = state?.tripType || 'oneway';
    
    useEffect(() => {
        dispatch(clearSelectedFlights());
    }, [dispatch]);

    const [filters, setFilters] = useState({
        airlines: [],
        priceRange: [1000, 10000], // Updated based on API response
        departureTime: null,
        arrivalTime: null,
        refundable: null,
        stops: []
    });

    return (
       <div className='innerpagecontainer'>
         <div className='relative'>
            {tripType === 'oneway' && (
                <Container className="mt-5 pt-5">
                    <Row>
                        <Col>
                            <FlightSearchBar />
                        </Col>
                    </Row>
                    <Row className="mt-4">
                        <Col lg={3}>
                            <FlightSidebar filters={filters} setFilters={setFilters} />
                        </Col>
                        <Col lg={9}>
                            <FlightList filters={filters} />
                        </Col>
                    </Row>
                </Container>
            )}

            {/* Round Trip Flights */}
            {tripType === 'roundtrip' && (
                <Container className="mt-5 pt-5 relative">
                    <Row>
                        <Col>
                            <RoundsearchBar />
                        </Col>
                    </Row>
                    <Row className="mt-4">
                        <Col lg={3}>
                            <FlightSidebar filters={filters} setFilters={setFilters} />
                        </Col>
                        <Col lg={9}>
                            <RoundTripCardList filters={filters} />
                        </Col>
                    </Row>
                </Container>
            )}
            <RoundTripBookingBar />
        </div>
       </div>
    );
};

export default FlightResultsPage;