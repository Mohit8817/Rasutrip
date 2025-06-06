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
      <Row className="justify-content-center">
        <Col xs={4} md={2}>
          <Card
            className={`text-center tab-box ${activeTab === 'flight' ? 'active-tab' : ''}`}
            onClick={() => handleTabClick('flight')}
          >
            <Card.Body>
              <FaPlane size={30} />
              <Card.Text className="mt-2">Flight</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={4} md={2}>
          <Card
            className={`text-center tab-box ${activeTab === 'hotel' ? 'active-tab' : ''}`}
            onClick={() => handleTabClick('hotel')}
          >
            <Card.Body>
              <FaHotel size={30} />
              <Card.Text className="mt-2">Hotel</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={4} md={2}>
          <Card
            className={`text-center tab-box ${activeTab === 'bus' ? 'active-tab' : ''}`}
            onClick={() => handleTabClick('bus')}
          >
            <Card.Body>
              <FaBus size={30} />
              <Card.Text className="mt-2">Bus</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TravelTabs;
