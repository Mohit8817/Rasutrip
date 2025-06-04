import React, { useState } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../Style/FlightBooking.css'; // Your custom styles

const FareTypeSelector = () => {
    const [selectedFare, setSelectedFare] = useState('regular');
    const [isNonStop, setIsNonStop] = useState(false);

    return (
        <div className="fare-type-container p-3 ">
            <Row className="align-items-center flex-wrap">
                <Col xs="auto">
                    <strong>Select A Fare Type</strong>
                </Col>

                <Col xs="auto">
                    <Form.Check
                        type="checkbox"
                        label="Non-Stop"
                        checked={isNonStop}
                        onChange={() => setIsNonStop(!isNonStop)}
                    />
                </Col>

                {[
                    { value: 'regular', label: 'Regular Fare' },
                    { value: 'student', label: 'Student Fares' },
                    { value: 'marine', label: 'Marine Fares' },
                    { value: 'senior', label: 'Senior Citizen' },
                    { value: 'armed', label: 'Armed Forces' },
                ].map(({ value, label }) => (
                    <Col xs="auto" key={value}>
                        <Form.Check
                            type="radio"
                            label={label}
                            name="fare"
                            id={value}
                            checked={selectedFare === value}
                            onChange={() => setSelectedFare(value)}
                        />
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default FareTypeSelector;
