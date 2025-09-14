import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { FaHotel, FaBus } from "react-icons/fa";
import flightsbook from "../../assest/flightsbook.svg";
import Hotels from "../../assest/Hotels.svg";
import buss from "../../assest/buss.svg";
import taxi from "../../assest/taxi.svg";
import driver from "../../assest/driver.png";
import "../../Style/FlightBooking.css"; // Adjust path to your CSS

const TravelTabs = ({ activeTab, setActiveTab }) => {
  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  return (
    <Container>
      <Row className="justify-content-start justify-content-md-center">
        <Col xs={4} md={2}>
          <Card
            className={`text-center tab-box ${
              activeTab === "flight" ? "active-tab" : ""
            }`}
            onClick={() => handleTabClick("flight")}
          >
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              {/* <FaPlane size={30} /> */}
              <img
                src={flightsbook}
                alt="Flight"
                style={{ width: "30px", height: "30px" }}
              />

              <Card.Text className="mt-2 mb-0">Flight</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={4} md={2}>
          <Card
            className={`text-center tab-box ${
              activeTab === "hotel" ? "active-tab" : ""
            }`}
            onClick={() => handleTabClick("hotel")}
          >
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              {/* <FaHotel size={30} /> */}
              <img
                src={Hotels}
                alt="Flight"
                style={{ width: "30px", height: "30px" }}
              />
              <Card.Text className="mt-2 mb-0">Hotel</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={4} md={2}>
          <Card
            className={`text-center tab-box ${
              activeTab === "bus" ? "active-tab" : ""
            }`}
            onClick={() => handleTabClick("bus")}
          >
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              {/* <FaBus size={30} /> */}
              <img
                src={buss}
                alt="Flight"
                style={{ width: "30px", height: "30px" }}
              />
              <Card.Text className="mt-2 mb-0">Bus</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        {/* fourth */}
        <Col xs={4} md={2}>
          <Card
            className={`text-center tab-box ${
              activeTab === "bus" ? "active-tab" : ""
            }`}
            onClick={() => handleTabClick("bus")}
          >
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              {/* <FaBus size={30} /> */}
              <img
                src={taxi}
                alt="Flight"
                style={{ width: "30px", height: "30px" }}
              />
              <Card.Text className="mt-2 mb-0">Driver</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        {/* fifth */}
        <Col xs={4} md={2}>
          <Card
            className={`text-center tab-box ${
              activeTab === "bus" ? "active-tab" : ""
            }`}
            onClick={() => handleTabClick("bus")}
          >
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              {/* <FaBus size={30} /> */}
              <img
                src={driver}
                alt="Flight"
                style={{ width: "30px", height: "30px" }}
              />
              <Card.Text className="mt-2 mb-0">Cabs</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TravelTabs;
