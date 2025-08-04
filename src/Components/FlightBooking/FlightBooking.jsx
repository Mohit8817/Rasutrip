import { Container, Row, Col } from 'react-bootstrap';
import TripTypeSelector from './TripTypeSelector';
import '../../Style/FlightBooking.css'; // Make sure this path is correct
import LocationInput from './LocationInput';
import DatePicker from './DatePicker';
import FareTypeSelector from './FareTypeSelector';
import PassengerClass from './PassengerClass';
import SearchButton from '../Common/SearchButton';

import React, { useState } from 'react';
import CitySegment from './MultiCity/CitySegment';
import DateSelect from './MultiCity/DateSelect';
import MultiCityForm from './MultiCity/MultiCityForm';
import AddCityButton from './MultiCity/AddCityButton';
import SecondDateSelecter from './MultiCity/SecondDateSelecter';
import AddMorecity from './MultiCity/AddMorecity';
import AddMorecitydatapick from './MultiCity/AddMorecitydatapick';

const FlightBooking = () => {
    const [tripType, setTripType] = useState('oneway');

    // for data pass input fields 
    const [toCityFromCitySegment, setToCityFromCitySegment] = useState('');

    const [cityComponents, setCityComponents] = useState([]);

    const handleAddCityClick = () => {
        if (cityComponents.length < 2) {
            // Add a unique ID (you can also use Date.now(), uuid, etc.)
            const newCity = { id: Date.now() };
            setCityComponents([...cityComponents, newCity]);
        }
    };

    const handleRemoveCity = (id) => {
        // Filter out the component with this id
        const updatedComponents = cityComponents.filter((city) => city.id !== id);
        setCityComponents(updatedComponents);
    };


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

                {/* One way trip components  */}
                {tripType !== 'multicity' && (
                    <Row className="mt-2">
                        <Col xs={12} sm={12} md={6} lg={5} className="mb-2">
                            <LocationInput />
                        </Col>

                        <Col xs={12} sm={6} md={6} lg={3} className="mb-2">
                            <DatePicker tripType={tripType} setTripType={setTripType} />
                        </Col>

                        <Col xs={12} sm={6} md={6} lg={3} className="mb-2">
                            <PassengerClass />
                        </Col>

                        <Col xs={12} sm={12} md={12} lg={1}>
                            <SearchButton type="flight" />
                        </Col>
                    </Row>

                )}

                {/* Multicity Component show  */}
                {/* this Row only show when i click multi city tab */}
                {tripType === 'multicity' && (
                    <Container className='p-0 m-0'>
                        <Row className="mt-2">
                            <Col xs={12} sm={12} md={6} lg={5} className="mb-2">
                                <CitySegment onToCityChange={setToCityFromCitySegment} />
                            </Col>

                            <Col xs={12} sm={6} md={3} lg={3} className="mb-2">
                                <DateSelect />
                            </Col>

                            <Col xs={12} sm={6} md={3} lg={3} className="mb-2">
                                <PassengerClass />
                            </Col>

                            <Col xs={12} sm={12} md={12} lg={1}>
                                <SearchButton type="flight" />
                            </Col>
                        </Row>

                        {/* Add city row  */}
                        <Row className="mt-2">
                            <Col xs={12} sm={12} md={6} lg={5} className="mb-2">
                                <MultiCityForm fromCityProp={toCityFromCitySegment} />
                            </Col>

                            <Col xs={12} sm={6} md={3} lg={3} className="mb-2">
                                <SecondDateSelecter />
                            </Col>

                            <Col xs={12} sm={6} md={2} lg={2} className="mb-2">
                                <AddCityButton onClick={handleAddCityClick} />
                            </Col>

                            <Col xs={12} sm={12} md={1} lg={2} className="mb-2">
                                {/* Optional content or spacer */}
                            </Col>
                        </Row>


                        {/* Render each AddMorecity row */}
                        {cityComponents.map((city, index) => (
                            <Row className="mt-2" key={index}>
                                <Col xs={12} sm={12} md={6} lg={5} className="mb-2">
                                    <AddMorecity />
                                </Col>

                                <Col xs={12} sm={6} md={4} lg={3} className="mb-2">
                                    <AddMorecitydatapick />
                                </Col>

                                <Col xs={6} sm={6} md={2} lg={1} className="mb-2">
                                    <button
                                        className="btn btn-secondary w-100"
                                        onClick={() => handleRemoveCity(city.id)}
                                    >
                                        X
                                    </button>
                                </Col>

                                <Col xs={12} sm={12} md={12} lg={3} className="mb-2">
                                    {/* Spacer or optional UI content */}
                                </Col>
                            </Row>

                        ))}
                    </Container>
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
