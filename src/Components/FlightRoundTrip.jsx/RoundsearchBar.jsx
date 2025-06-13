import React from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import '../../Style/Pagescss/FlightResultsPage.css';

const RoundsearchBar = () => {
    const { state } = useLocation();

    const {
        fromCity = 'Delhi',
        toCity = 'Mumbai',
        fromAirport = 'DEL',
        toAirport = 'BOM',
        departDate,
        returnDate,
        passengers = { adults: 1, children: 0, infants: 0 },
        cabinClass = 'ANY',
    } = state || {};

    const totalPassengers = passengers.adults + passengers.children + passengers.infants;

    const formattedDepartDate = departDate
        ? new Date(departDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }) + ', ' + new Date(departDate).toLocaleDateString('en-GB', { weekday: 'long' })
        : 'Not selected';

    const formattedReturnDate = returnDate
        ? new Date(returnDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }) + ', ' + new Date(returnDate).toLocaleDateString('en-GB', { weekday: 'long' })
        : '--/--/----';

    return (
        <div>
            <Container className="p-3 bg-white shadow-sm rounded border mt-5 overflow-auto">
                <Row className="flex-nowrap align-items-center text-center text-md-start">
                    <Col style={{ minWidth: '40px' }}>
                        <strong>{fromAirport}</strong>
                        <div className="text-muted small">{fromCity}</div>
                    </Col>

                    <Col style={{ minWidth: '40px' }}>
                        <div style={{ fontSize: '20px' }}>→</div>
                    </Col>

                    <Col style={{ minWidth: '40x' }}>
                        <strong>{toAirport}</strong>
                        <div className="text-muted small">{toCity}</div>
                    </Col>

                    <Col style={{ minWidth: '150px' }}>
                        <div><strong>Departure</strong></div>
                        <div className="text-muted small">{formattedDepartDate}</div>
                    </Col>

                    <Col style={{ minWidth: '150px' }}>
                        <div><strong>Return</strong></div>
                        <div className="text-muted small">{formattedReturnDate}</div>
                    </Col>

                    <Col style={{ minWidth: '120px' }}>
                        <div><strong>Travellers</strong></div>
                        <div className="text-muted small">{totalPassengers}</div>
                    </Col>

                    <Col style={{ minWidth: '120px' }}>
                        <div><strong>Travel Class</strong></div>
                        <div className="text-muted small">{cabinClass}</div>
                    </Col>

                    <Col style={{ minWidth: '100px' }} className="text-end">
                        <Button variant="primary" className="ModifyButton">
                            Modify
                        </Button>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default RoundsearchBar;
