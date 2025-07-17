import React from 'react';
import { Container, Row, Col, Card, Button, Tab, Nav } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';

const paymentGateways = [
    { name: 'Easebuzz', logo: 'easebuzz.png' },
    { name: 'BillDesk', logo: 'billdesk.png' },
    { name: 'PhonePe', logo: 'phonepe.png' },
    { name: 'PayU', logo: 'payu.png' },
    { name: 'ICICI Bank', logo: 'icici-bank.png' },
    { name: 'Razorpay', logo: 'razorpay.png' },


];

const BusPaymentInfo = () => {
    const { state } = useLocation();

    const {
        bus,
        selectedSeats,
        totalPrice,
        departTime,
        arriveTime,
        boarding,
        fromCity,
        toCity,
        departDate,
        passengerData,
        contactData,
    } = state || {};

    return (
        <Container className="py-4">
            {/* Travel Summary */}
            <Card className="mb-4 shadow-sm">
                <Card.Body>
                    <Row>
                        <Col md={3}><strong>{fromCity} - {toCity}</strong><br />{bus?.operator} - {bus?.busType}</Col>
                        <Col md={3}><strong>Origin</strong><br />{fromCity}</Col>
                        <Col md={3}><strong>Destination</strong><br />{toCity}</Col>
                        <Col md={3}><strong>Travel Date</strong><br />{new Date(departDate).toDateString()}</Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Traveller Info */}
            <Card className="mb-3 shadow-sm">
                <Card.Body>
                    {passengerData?.map((p, index) => (
                        <Row key={index}>
                            <Col md={6}><strong>Traveller:</strong> {p.firstName} {p.lastName}</Col>
                            <Col md={6}>
                                <strong>Age:</strong> {p.age} &nbsp;
                                <strong>Seat No:</strong> {selectedSeats?.[index]?.SeatName}
                            </Col>
                        </Row>
                    ))}
                </Card.Body>
            </Card>


            {/* Contact Info */}
            <Card className="mb-4 shadow-sm">
                <Card.Body>
                    <Row>
                        <Col md={6}><strong>📞 Contact : </strong> {contactData?.mobile}</Col>
                        <Col md={6}><strong>✉️ Email : </strong> {contactData?.email}</Col>
                    </Row>
                </Card.Body>
            </Card>

            <Card className="shadow-sm">
                <Card.Body>
                    <h5 className="mb-3">Payment Options</h5>
                    <Tab.Container defaultActiveKey="debit">
                        <Row>
                            <Col sm={3}>
                                <Nav variant="pills" className="flex-column ">
                                    <Nav.Item><Nav.Link eventKey="debit">Debit Card</Nav.Link></Nav.Item>
                                    <Nav.Item><Nav.Link eventKey="credit">Credit Card</Nav.Link></Nav.Item>
                                    <Nav.Item><Nav.Link eventKey="netbanking">NetBanking</Nav.Link></Nav.Item>
                                    <Nav.Item><Nav.Link eventKey="wallet">Mobile Wallet</Nav.Link></Nav.Item>
                                    <Nav.Item><Nav.Link eventKey="upi">UPI</Nav.Link></Nav.Item>
                                </Nav>
                            </Col>

                            <Col sm={9}>
                                <Tab.Content>
                                    <Tab.Pane eventKey="debit">
                                        <Row className="g-3">
                                            {paymentGateways.map((gateway, idx) => (
                                                <Col md={4} key={idx}>
                                                    <Card className="text-center p-3 border rounded shadow-sm" style={{ minHeight: '120px' }}>
                                                        <img
                                                            src={`/payment-logos/${gateway.logo}`}
                                                            alt={gateway.name}
                                                            style={{ maxHeight: '40px', objectFit: 'contain', marginBottom: '8px' }}
                                                        />
                                                        <div style={{ fontSize: '13px' }}>{gateway.name.toUpperCase()}</div>
                                                    </Card>
                                                </Col>
                                            ))}
                                        </Row>
                                    </Tab.Pane>
                                    {/* Other tabs can be added here similarly */}
                                </Tab.Content>


                            </Col>
                        </Row>
                    </Tab.Container>
                </Card.Body>
            </Card>
            {/* Pay Button */}
            <div className="mt-4">
                <p><strong>Convenience Fee:</strong> 0</p>
                <p className="text-muted small">
                    <strong>Please note:</strong> By placing this order, you agree to our <a href="#">Terms Of Use</a> and <a href="#">Privacy Policy</a>
                </p>
                <Button variant="danger" size="lg" className='btn-red'>Pay Now ₹ {totalPrice?.toFixed(2)}</Button>
            </div>
        </Container>
    );
};

export default BusPaymentInfo;
