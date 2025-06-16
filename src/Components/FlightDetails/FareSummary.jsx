import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import '../../Style/Pagescss/FlightResultsPage.css';// Update path as per your structure

const FareSummary = () => {
    return (
        <Card className="fare-summary-card mb-3">
            <Card.Header className="bg-light fw-bold">Fare Summary</Card.Header>
            <Card.Body className="px-3 py-2">
                <Row className="fare-row py-1">
                    <Col>Base Fare</Col>
                    <Col className="text-end">₹ 6466</Col>
                </Row>
                <Row className="fare-row py-1">
                    <Col>Taxes</Col>
                    <Col className="text-end">₹ 1020</Col>
                </Row>
                <Row className="fare-row py-1">
                    <Col>Service Charges</Col>
                    <Col className="text-end">₹ 0</Col>
                </Row>
                <Row className="fare-row py-1">
                    <Col>GST (+)</Col>
                    <Col className="text-end">₹ 0</Col>
                </Row>
                <Row className="fare-row py-1">
                    <Col>Meal (+)</Col>
                    <Col className="text-end">₹ 0</Col>
                </Row>
                <Row className="fare-row py-1">
                    <Col>Baggage (+)</Col>
                    <Col className="text-end">₹ 0</Col>
                </Row>
                <Row className="fare-row py-1">
                    <Col>Seat (+)</Col>
                    <Col className="text-end">₹ 0</Col>
                </Row>
            </Card.Body>
            <Card.Footer className="bg-light fw-bold d-flex justify-content-between">
                <span>Pay Amount</span>
                <span>₹ 7486</span>
            </Card.Footer>
        </Card>
    );
};

export default FareSummary;
