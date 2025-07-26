import React, { useState } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import '../../Style/Pagescss/FlightResultsPage.css';// Update path as per your structure

const FareSummary = ({ passengerSelections = [], SelectedFare = {} }) => {

    const [fare, setFare] = useState(SelectedFare);
    // const [fare, setFare] = useState(SelectedFare);
    const selectedFlight = localStorage.getItem('selectedFlight')
    const rasocommision = localStorage.getItem('rasocommision')

    const data = JSON.parse(selectedFlight);
    console.log('data', data)
    console.log('passengerSelections', passengerSelections)
    const baseFare = fare?.PublishedPrice || 0;
    const tax = baseFare * 0.18;
   const servicrCharge =baseFare*rasocommision/100

   const totalMeal = passengerSelections.reduce((acc, p) => acc + (p?.meal?.Price || 0), 0);
const totalBaggage = passengerSelections.reduce((acc, p) => acc + (p?.baggage?.Price || 0), 0);
const totalSeat = passengerSelections.reduce((acc, p) => acc + (p?.seat?.Price || 0), 0);


    const totalPay = (baseFare + tax + totalMeal + totalBaggage + totalSeat).toFixed(2);


    return (
        <Card className="fare-summary-card mb-3">
            <Card.Header className="bg-light fw-bold">Fare Summary</Card.Header>
            <Card.Body className="px-3 py-2">
                <Row className="fare-row py-1">
                    <Col>Base Fare</Col>
                    <Col className="text-end">₹ {fare?.PublishedPrice?.toFixed(2) || "0.00"}</Col>
                </Row>

                <Row className="fare-row py-1">
                    <Col>Taxes</Col>
                    <Col className="text-end">
                        ₹ {(fare?.PublishedPrice ? (fare.PublishedPrice * 0.18).toFixed(2) : "0.00")}
                    </Col>
                </Row>

                <Row className="fare-row py-1">
                    <Col>Convenience Fee</Col>
                    <Col className="text-end">₹ {(servicrCharge??0.00).toFixed(2)}</Col>
                </Row>

                <Row className="fare-row py-1">
                    <Col>GST (+)</Col>
                    <Col className="text-end">₹ 0</Col>
                </Row>

                <Row className="fare-row py-1">
                    <Col>Meal (+)</Col>
                    <Col className="text-end">
                        ₹ {passengerSelections?.reduce((acc, p) => acc + (p?.meal?.Price || 0), 0).toFixed(2)}
                    </Col>
                </Row>

                <Row className="fare-row py-1">
                    <Col>Baggage (+)</Col>
                    <Col className="text-end">
                        ₹ {passengerSelections?.reduce((acc, p) => acc + (p?.baggage?.Price || 0), 0).toFixed(2)}
                    </Col>
                </Row>

                <Row className="fare-row py-1">
                    <Col>Seat (+)</Col>
                    <Col className="text-end">
                        ₹ {passengerSelections?.reduce((acc, p) => acc + (p?.seat?.Price || 0), 0).toFixed(2)}
                    </Col>
                </Row>
            </Card.Body>

            <Card.Footer className="bg-light fw-bold d-flex justify-content-between">
                <span>Pay Amount</span>
                <span>
                    ₹ {(
                        (fare?.PublishedPrice || 0) +
                        (fare?.PublishedPrice || 0) * 0.18 + (fare?.PublishedPrice || 0) * 0.12 +
                        passengerSelections?.reduce((acc, p) => acc + (p?.meal?.Price || 0), 0) +
                        passengerSelections?.reduce((acc, p) => acc + (p?.baggage?.Price || 0), 0) +
                        passengerSelections?.reduce((acc, p) => acc + (p?.seat?.Price || 0), 0)
                    ).toFixed(2)}
                </span>
            </Card.Footer>
        </Card>

    );
};

export default FareSummary;
