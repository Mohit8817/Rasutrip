import { Container, Row, Col } from 'react-bootstrap';
import TripTypeSelector from './TripTypeSelector';
import '../../Style/FlightBooking.css'; // Make sure this path is correct
import LocationInput from './LocationInput';
import DatePicker from './DatePicker';
import FareTypeSelector from './FareTypeSelector';
import PassengerClass from './PassengerClass';
import SearchButton from './SearchButton';

import React, { useState } from 'react';
import CitySegment from './MultiCity/CitySegment';
import DateSelect from './MultiCity/DateSelect';

const FlightBooking = () => {
    const [tripType, setTripType] = useState('oneway');
    return (
        <div className="booking-container pt-0 mt-0">
            <Container>
                <Row className="align-items-center">
                    <Col lg={6}>
                        <div className="tripselector">
                            <TripTypeSelector tripType={tripType} setTripType={setTripType} />
                        </div>
                    </Col>
                    <Col lg={6} className="text-end">
                        <p className="flight-tagline">
                            Millions of cheap flights. One simple search
                        </p>
                    </Col>
                </Row>


                <Row className='mt-2'>
                    <Col lg={5}>
                        <LocationInput />
                    </Col>
                    <Col lg={3}>
                        <DatePicker tripType={tripType} setTripType={setTripType} />
                    </Col>
                    <Col lg={3}>
                        <PassengerClass />
                    </Col>
                    <Col lg={1}>
                        <SearchButton />
                    </Col>
                </Row>


                {/* this Row only show when i click multi city tab */}
                {tripType === 'multicity' && (
                    <Row className='mt-2'>
                        <Col lg={5}>
                            <CitySegment />
                        </Col>
                        <Col lg={3}>
                            <DateSelect />
                        </Col>
                        <Col lg={3}>
                            <PassengerClass />
                        </Col>
                        <Col lg={1}>
                            <SearchButton />
                        </Col>
                    </Row>
                )}





                <Row>
                    <Col>
                        <FareTypeSelector />
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default FlightBooking;
