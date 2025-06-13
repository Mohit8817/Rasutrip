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
                            <SearchButton type="flight" />
                        </Col>
                    </Row>
                )}

                {/* Multicity Component show  */}
                {/* this Row only show when i click multi city tab */}
                {tripType === 'multicity' && (
                    <Container className='p-0 m-0'>
                        <Row className='mt-2'>
                            <Col lg={5}>
                                <CitySegment onToCityChange={setToCityFromCitySegment} />
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
                        {/* Add city row  */}
                        <Row className='mt-2'>
                            <Col lg={5}>
                                <MultiCityForm fromCityProp={toCityFromCitySegment} />
                            </Col>
                            <Col lg={3}>
                                <SecondDateSelecter />
                            </Col>

                            <Col lg={2}>
                                <AddCityButton onClick={handleAddCityClick} />
                            </Col>
                            <Col lg={2}>
                            </Col>
                        </Row>

                        {/* Render each AddMorecity row */}
                        {cityComponents.map((city, index) => (
                            <Row className='mt-2' key={index}>
                                <Col lg={5}>
                                    <AddMorecity />
                                </Col>
                                <Col lg={3}>
                                    <AddMorecitydatapick />
                                </Col>
                                <Col lg={1}>
                                    {/* Remove button */}
                                    <div>
                                        <button
                                            className='btn btn-secondary'
                                            onClick={() => handleRemoveCity(city.id)}
                                        >
                                            X
                                        </button>
                                    </div>
                                </Col>
                                <Col lg={3}></Col>
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
