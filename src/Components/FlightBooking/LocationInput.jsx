import { Row, Col, Card } from 'react-bootstrap';
import { ArrowLeftRight } from 'react-bootstrap-icons'; // Icon from react-bootstrap-icons
import '../../Style/FlightBooking.css'; // Add your custom styles

const LocationInput = () => {
  return (
    <Card className="location-card">
      <Row className="g-0 align-items-center">
        {/* FROM */}
        <Col xs={5} className="location-box">
          <span className="location-label">FROM</span>
          <div className="location-city">Delhi</div>
          <div className="location-airport">[DEL] Delhi Indira Gand...</div>
        </Col>

        {/* ICON */}
        <Col xs={2} className="text-center switch-icon-wrapper">
          <div className="switch-icon">
            <ArrowLeftRight size={20} />
          </div>
        </Col>

        {/* TO */}
        <Col xs={5} className="location-box">
          <span className="location-label">TO</span>
          <div className="location-city">Mumbai</div>
          <div className="location-airport">[BOM] Chhatrapati Shiv...</div>
        </Col>
      </Row>
    </Card>
  );
};

export default LocationInput;
