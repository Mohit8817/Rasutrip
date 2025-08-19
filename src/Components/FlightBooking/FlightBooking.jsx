'use cleint'
import { useState, useEffect, useContext } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import TripTypeSelector from './TripTypeSelector';
import '../../Style/FlightBooking.css'; // Make sure this path is correct
import LocationInput from './LocationInput';
import DatePicker from './DatePicker';
import FareTypeSelector from './FareTypeSelector';
import PassengerClass from './PassengerClass';
import SearchButton from '../Common/SearchButton';
import moment from "moment";
import CitySegment from './MultiCity/CitySegment';
import DateSelect from './MultiCity/DateSelect';
import MultiCityForm from './MultiCity/MultiCityForm';
import AddCityButton from './MultiCity/AddCityButton';
import SecondDateSelecter from './MultiCity/SecondDateSelecter';
import AddMorecity from './MultiCity/AddMorecity';
import AddMorecitydatapick from './MultiCity/AddMorecitydatapick';


const FlightBooking = () => {
    const [tripType, setTripType] = useState('oneway');

    const [toCityFromCitySegment, setToCityFromCitySegment] = useState('');


    const [cityComponents, setCityComponents] = useState([]);

    const handleAddCityClick = () => {
        if (cityComponents.length < 2) {
            const newCity = { id: Date.now() };
            setCityComponents([...cityComponents, newCity]);
        }
    };
    const handleSelect = (dataSelect) => {
        console.log('dataSelect', dataSelect)
    }
    const handleRemoveCity = (id) => {
        const updatedComponents = cityComponents.filter((city) => city.id !== id);
        setCityComponents(updatedComponents);
    };

        const [segments, setSegments] = useState([
            { id: 0, from: "", to: "", Origin: "", Destination: "", PreferredTime: new Date() },
            { id: 1, from: "", to: "", Origin: "", Destination: "", PreferredTime: new Date() },
        ]);
        useEffect(() => {
        }, [segments]);
        const handleDateChange = (id, date) => {
            const formattedDate = moment(date).format("YYYY-MM-DD") + "T00:00:00";
            setSegments((prev) =>
                prev.map((seg) =>
                    seg.id === id ? { ...seg, PreferredTime: formattedDate } : seg
                )
            );
        };

        const handleCityChange = (id, city) => {
            setSegments((prev) =>
                prev.map((seg) => {
                    if (seg.id === id) {
                        if (city.type === "from") {
                            return {
                                ...seg,
                                from: city.cityObj.city,
                                Origin: city.cityObj.code
                            };
                        } else if (city.type === "to") {
                            return {
                                ...seg,
                                to: city.cityObj.city,
                                Destination: city.cityObj.code
                            };
                        }
                    }
                    return seg;
                })
            );
        };


        // Add another row
        const addSegment = () => {
            setSegments((prev) => [
                ...prev,
                { id: Date.now(), from: "", to: "", Origin: "", Destination: "", PreferredTime: new Date() }
            ]);
        };

        // Remove row
        const removeSegment = (id) => {
            setSegments((prev) => prev.filter((seg) => seg.id !== id));
        };

        // setLocationData(segments)
        // if(tripType=='multicity'){
            localStorage.setItem('locationData', JSON.stringify(segments))

        // }
    // }
    // }
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

                        {segments.map((seg, index) => (
                            <Row className="mt-2" key={seg.id}>
                                <Col xs={12} sm={12} md={6} lg={5} className="mb-2">
                                    <CitySegment id={index}
                                        onSelect={(city) => handleCityChange(seg.id, city)}
                                        onToCityChange={setToCityFromCitySegment}
                                    />
                                </Col>

                                <Col xs={12} sm={6} md={3} lg={3} className="mb-2">
                                    <DateSelect
                                        onDateChange={(date) => handleDateChange(seg.id, date)}
                                    />
                                </Col>

                                {/* First row me Passenger aur Search button dikhana */}
                                {index === 0 && (
                                    <>
                                        <Col xs={12} sm={6} md={3} lg={3} className="mb-2">
                                            <PassengerClass />
                                        </Col>
                                        <Col xs={12} sm={12} md={12} lg={1}>
                                            <SearchButton type="flight" />
                                        </Col>
                                    </>
                                )}

                                {/* Second row se sirf remove button option */}
                                {index > 0 && (
                                    <Col xs={6} sm={6} md={2} lg={1} className="mb-2">
                                        <button
                                            className="btn btn-secondary w-100"
                                            onClick={() => removeSegment(seg.id)}
                                        >
                                            X
                                        </button>
                                    </Col>
                                )}
                            </Row>
                        ))}

                        {/* Add more city button */}
                        <Row className="mt-2">
                            <Col xs={12}>
                                <button className="btn btn-primary" onClick={addSegment}>
                                    + Add City
                                </button>
                            </Col>
                        </Row>

                        {/* Add city row  */}

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
