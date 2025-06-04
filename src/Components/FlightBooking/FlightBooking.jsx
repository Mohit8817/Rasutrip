import { Container, Row, Col } from 'react-bootstrap';
import TripTypeSelector from './TripTypeSelector';
import '../../Style/FlightBooking.css'; // Make sure this path is correct
import LocationInput from './LocationInput';
import DatePicker from './DatePicker';

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
            <Col lg={4}>
                <LocationInput/>
            </Col>
            <Col lg={4}>
                <DatePicker/>
            </Col>
            <Col lg={4}></Col>
        </Row>
      </Container>
    </div>
  );
};

export default FlightBooking;
