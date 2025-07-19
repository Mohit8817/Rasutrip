import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const FAQ = () => {
    return (
        <div className="terms-wrapper py-5">
            <Container className="rounded shadow p-4 bg-white">
                <Row>
                    <Col>
                        <h2 className="text-center fw-bold mb-4">FAQ - Frequently Asked Questions</h2>
                        <p className="text-center text-muted">RASUTRIP.com</p>

                        <h5 className="fw-bold mt-4">Categories:</h5>
                        <ul>
                            <li>Domestic Flight Booking</li>
                            <li>International Flight Booking</li>
                            <li>Hotel Booking</li>
                            <li>Registration and Sign In</li>
                            <li>Payment Options</li>
                        </ul>

                        <h5 className="fw-bold mt-4">Domestic Flight Booking</h5>
                        <h6 className="fw-bold mt-3">Queries Before Booking Flights</h6>
                        <ul>
                            <li><strong>Q:</strong> Does RASUTRIP provide ticket booking for infants?<br /><strong>A:</strong> Yes, for children under 2 years. One infant per adult.</li>
                            <li><strong>Q:</strong> How many seats can I book at once?<br /><strong>A:</strong> Up to 9 seats. Book again for more.</li>
                            <li><strong>Q:</strong> Can I book via phone?<br /><strong>A:</strong> Yes, 24/7 support is available.</li>
                            <li><strong>Q:</strong> Can I book multi-city trips?<br /><strong>A:</strong> Yes, multi-city bookings are supported.</li>
                            <li><strong>Q:</strong> What are e-tickets?<br /><strong>A:</strong> Email documents with confirmation details.</li>
                        </ul>

                        <h6 className="fw-bold mt-3">Queries While Booking Flights</h6>
                        <ul>
                            <li>Clear browser cache if you see zero results.</li>
                            <li>Group booking restrictions may limit flight results.</li>
                        </ul>

                        <h6 className="fw-bold mt-3">Queries After Booking Flights</h6>
                        <ul>
                            <li>Confirmation is sent by email/SMS.</li>
                            <li>ID proof needed at airport: Aadhaar, Voter ID, etc.</li>
                            <li>Name changes require correction request or rebooking.</li>
                            <li>Boarding pass given at check-in counter.</li>
                        </ul>

                        <h6 className="fw-bold mt-3">Cancellation and Refunds</h6>
                        <ul>
                            <li>Yes, flights can be cancelled through us.</li>
                            <li>Charges depend on timing/airline.</li>
                            <li>Refunds take 7–12 business days.</li>
                        </ul>

                        <h5 className="fw-bold mt-4">International Flight Booking</h5>
                        <h6 className="fw-bold mt-3">Queries Before Booking</h6>
                        <ul>
                            <li>Use 3-letter airport codes for search.</li>
                            <li>Classes: Economy, Business, First-Class (select routes).</li>
                            <li>Direct = no aircraft change; Indirect = stopovers.</li>
                            <li>Infants must have passport,  24 months old.</li>
                        </ul>

                        <h6 className="fw-bold mt-3">Special Requests</h6>
                        <ul>
                            <li>Special meals and seat selection available (may cost extra).</li>
                        </ul>

                        <h6 className="fw-bold mt-3">Queries After Booking</h6>
                        <ul>
                            <li>Email/SMS confirmation will be sent.</li>
                            <li>Boarding pass from check-in counter.</li>
                            <li>Passport is mandatory for international travel.</li>
                        </ul>

                        <h6 className="fw-bold mt-3">Cancellation and Refunds</h6>
                        <ul>
                            <li>Yes, international bookings can be cancelled.</li>
                            <li>Refunds within 7–12 business days.</li>
                            <li>Contact airline if within 2 hours of departure.</li>
                        </ul>

                        <h5 className="fw-bold mt-4">Hotel Booking</h5>
                        <h6 className="fw-bold mt-3">Queries Before Booking</h6>
                        <ul>
                            <li>Some hotels allow more than 2 adults (with extra charge).</li>
                            <li>Children allowed free if beds are selected properly.</li>
                        </ul>

                        <h6 className="fw-bold mt-3">After Booking</h6>
                        <ul>
                            <li>Confirmation sent via email.</li>
                            <li>If not received, contact support.</li>
                            <li>Late check-in allowed with card reservation.</li>
                            <li>Early check-in based on availability.</li>
                            <li>Receipt is part of your booking email.</li>
                        </ul>

                        <h6 className="fw-bold mt-3">Cancellation and Refunds</h6>
                        <ul>
                            <li>Cancel online or contact support.</li>
                            <li>Refunds in 7–10 business days.</li>
                        </ul>

                        <h6 className="fw-bold mt-3">International Pay Hotels</h6>
                        <ul>
                            <li>Valid credit card is required.</li>
                            <li>Confirmation email and voucher will be sent.</li>
                        </ul>

                        <h5 className="fw-bold mt-4">Registration and Sign In</h5>
                        <ul>
                            <li>Registration is not mandatory but required to book.</li>
                            <li>Benefits: Offers, 24/7 support, personalized service.</li>
                            <li>Forgot password? Use reset option.</li>
                            <li>Profile can be edited after login.</li>
                        </ul>

                        <h5 className="fw-bold mt-4">Payment Options</h5>
                        <ul>
                            <li>Payments via UPI, wallets, cards, net banking.</li>
                            <li>Card data is secure with encryption.</li>
                            <li>VBV = Verified by Visa, extra security layer.</li>
                            <li>Contact support to verify VBV banks.</li>
                            <li>Session expiration may occur due to timeout.</li>
                            <li>Net banking refunds go to original payment source.</li>
                        </ul>

                        <p>
                            Ready to experience travel the <strong>RASUTRIP</strong> way?
                            <br />
                            📱 Download our app or 🌐 visit our website:&nbsp;
                            <a
                                href="http://rasutrip.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#000', textDecoration: 'none' }}
                            >
                                rasutrip.com
                            </a>
                            <br />
                            📞 Call us anytime – We're here 24/7:&nbsp;
                            <a
                                href="tel:9266424809"
                                style={{ color: '#000', textDecoration: 'none' }}
                            >
                                9266424809
                            </a>
                            <br />
                            💬 Chat with our experts – Get instant assistance
                        </p>

                        <p className="mt-4">
                            For further assistance, contact our support team anytime at&nbsp;
                            <a
                                href="tel:9266424809"
                                style={{ fontWeight: 'bold', color: '#000', textDecoration: 'none' }}
                            >
                               9266424809
                            </a>
                            &nbsp;or email&nbsp;
                            <a
                                href="mailto:support@rasutrip.com"
                                style={{ fontWeight: 'bold', color: '#000', textDecoration: 'none' }}
                            >
                                support@rasutrip.com
                            </a>
                            .
                        </p>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default FAQ;
