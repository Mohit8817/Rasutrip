import React from 'react';
import { Container, Row, Col, Nav, Button, NavLink } from 'react-bootstrap';
import '../../Style/Dealsection.css';

const TABS = ['ALL', 'FLIGHT', 'HOTEL', 'BUS'];

const DealsTabs = ({ activeTab, onTabChange }) => {
  return (
    <Container fluid className="deals-tabs-section  py-3 px-4">
      <Row className="align-items-center justify-content-between">
        <Col md="auto">
          <div className="d-flex align-items-center gap-4">
            <h3 className="mb-0 ">Exclusive <span className="text-dark fw-bold">Deals</span></h3>
            <Nav variant="pills" className="deals-tabs">
              {TABS.map((tab) => (
                <Nav.Item key={tab}>
                  <Nav.Link
                    eventKey={tab}
                    active={activeTab === tab}
                    onClick={() => onTabChange(tab)}
                    className={`deals-tab ${activeTab === tab ? 'active' : ''}`}
                  >
                    {tab}
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
          </div>
        </Col>

        <Col md="auto">
          <div className="d-flex align-items-center gap-2">
            <NavLink href="#" className="text-decoration-none fw-bold">View All Offers</NavLink>
            <Button variant="light" className="rounded-circle">
              <span>&larr;</span>
            </Button>
            <Button variant="primary" className="rounded-circle">
              <span>&rarr;</span>
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default DealsTabs;
