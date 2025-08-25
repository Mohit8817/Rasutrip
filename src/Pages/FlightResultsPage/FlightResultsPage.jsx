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
import Slider from '../../Components/hero/Slider';
import SearchButton from '../../Components/Common/SearchButton';

import MultiCityList from '../../Components/FlightBooking/MultiCity/MultiCityList';
import { useSelector } from 'react-redux';
import { Loader } from 'lucide-react';


const FlightResultsPage = () => {
    const dispatch = useDispatch();
    const { state } = useLocation();
    const tripType = state?.tripType || 'oneway';
    console.log('triptypeKrishnastate',state)

   console.log('triptypeKrishna',tripType)

  useEffect(() => {
        dispatch(clearSelectedFlights());
    }, [dispatch]);

  const flightsData = useSelector((state) => state?.flight?.flights || []);
    const [filters, setFilters] = useState({
        airlines: [],
        stops: [],
        priceRange: [0, 100000],
        departureTime: [0, 24],
        arrivalTime: [0, 24],
        refundableOnly: false,
        refundable: ""
    });

    if(Loader)
    

    return (
       <div className=''>
         <div className='relative'>
            {tripType === 'oneway' && (
                <Container className="">
                    <Row>
                        <Col className='d-none d-lg-block'>
                            <FlightSearchBar />
                        </Col>
                    </Row>
                    <Row className="mt-4 ">
                        <Col lg={3} className='d-none d-lg-block'>
                            <FlightSidebar className="" filters={filters} setFilters={setFilters} />
                        </Col>
                        <Col lg={9}>
                            <FlightList filters={filters} />
                        </Col>
                    </Row>
                </Container>
            )}
              {tripType === 'multicity' && (
                <Container className="">
                    <Row>
                        <Col className='d-none d-lg-block'>
                            <FlightSearchBar />
                        </Col>
                    </Row>
                    <Row className="mt-4">
                        <Col lg={3} className='d-none d-lg-block'>
                            <FlightSidebar className="d-none d-lg-block" filters={filters} setFilters={setFilters} />
                        </Col>
                        <Col lg={9}>
                            <MultiCityList filters={filters} />
                        </Col>
                    </Row>
                </Container>
            )}

            {/* Round Trip Flights */}
            {tripType === 'roundtrip' && (
                <Container className=" relative">
                    <Row>
                        <Col className='d-none d-lg-block'>
                        <FlightSearchBar />

                            {/* <RoundsearchBar /> */}
                        </Col>
                    </Row>
                    <Row className="mt-4">
                        <Col lg={3} className='d-none d-lg-block'>
                        <FlightSidebar className="d-none d-lg-block" filters={filters} setFilters={setFilters} />

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