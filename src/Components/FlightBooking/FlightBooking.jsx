import { Container, Row, Col } from 'react-bootstrap';
import TripTypeSelector from './TripTypeSelector';
import '../../Style/FlightBooking.css'; // Make sure this path is correct
import LocationInput from './LocationInput';
import DatePicker from './DatePicker';
import FareTypeSelector from './FareTypeSelector';
import PassengerClass from './PassengerClass';
import SearchButton from './SearchButton';

const FlightBooking = () => {
    return (
        <div className="booking-container">
            <Container>
                <Row className="align-items-center">
                    <Col lg={6}>
                        <div className="tripselector">
                            <TripTypeSelector />
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
                        <DatePicker />
                    </Col>
                    <Col lg={3}>
                        <PassengerClass />
                    </Col>
                    <Col lg={1}>
                        <SearchButton/>
                    </Col>
                </Row>


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
