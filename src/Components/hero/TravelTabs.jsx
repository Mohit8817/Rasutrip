import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaPlane, FaHotel, FaBus } from 'react-icons/fa';
import '../../Style/FlightBooking.css'; // Adjust path to your CSS

const TravelTabs = ({ activeTab, setActiveTab }) => {
  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  return (
    <Container>
      <Row className="justify-content-start justify-content-md-center">

        <Col xs={4} md={2}>
          <Card
            className={`text-center tab-box ${activeTab === 'flight' ? 'active-tab' : ''}`}
            onClick={() => handleTabClick('flight')}
          >
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <FaPlane size={30} />
              <Card.Text className="mt-2 mb-0">Flight</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={4} md={2}>
          <Card
            className={`text-center tab-box ${activeTab === 'hotel' ? 'active-tab' : ''}`}
            onClick={() => handleTabClick('hotel')}
          >
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <FaHotel size={30} />
              <Card.Text className="mt-2 mb-0">Hotel</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={4} md={2}>
          <Card
            className={`text-center tab-box ${activeTab === 'bus' ? 'active-tab' : ''}`}
            onClick={() => handleTabClick('bus')}
          >
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <FaBus size={30} />
              <Card.Text className="mt-2 mb-0">Bus</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TravelTabs;