import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../Style/Footer.css'; // You can add styles here
import footerlogo from '../../assest/rasutrip.png'
const Footer = () => {
    return (
        <footer className="footer py-5 bg-white">
            <Container>
                <Row>
                    {/* Column 1 - Logo & Contact */}
                    <Col md={4} className="mb-4 mb-md-0">
                        <img
                            className='footerlogo'
                            src={footerlogo}
                            alt="rasutrip"
                        />
                        <div className="d-flex text-start mb-3">
                            <FaPhoneAlt className="footer-icon me-3 mt-1" size={20} />
                            <div>
                                <div className="fw-semibold">Customer Support</div>
                                <div>+91 96488 22608</div>
                            </div>
                        </div>
                        <div className="d-flex text-start mb-3">
                            <FaEnvelope className="footer-icon me-3 mt-1" size={20} />
                            <div>
                                <div className="fw-semibold">Drop Us an Email</div>
                                <div>rasutrip.com</div>
                            </div>
                        </div>
                        <div className="d-flex text-start mb-3">
                            <FaMapMarkerAlt className="footer-icon me-3 mt-1" size={20} />
                            <div>
                                <div className="fw-semibold">Company Address</div>
                                <div>
                                    B-11, Sector 72, Noida, UP 201301
                                </div>
                            </div>
                        </div>
                    </Col>

                    {/* Column 2 - Company */}
                    <Col md={2} className="mb-4 mb-md-0 text-start">
                        <h5 className="footer-heading">Company</h5>
                        <ul className="list-unstyled">
                            <li className="mb-2">About Us</li>
                            <li>Frequently Asked Questions</li>
                        </ul>
                    </Col>

                    {/* Column 3 - Services */}
                    <Col md={2} className="mb-4 mb-md-0 text-start">
                        <h5 className="footer-heading">Services</h5>
                        <ul className="list-unstyled">
                            <li className="mb-2">Flight</li>
                            <li className="mb-2">Hotel</li>
                            <li>Bus</li>
                        </ul>
                    </Col>

                    {/* Column 4 - Legal */}
                    <Col md={2} className="mb-4 mb-md-0 text-start">
                        <h5 className="footer-heading">Legal</h5>
                        <ul className="list-unstyled">
                            <li className="mb-2">Terms & Conditions</li>
                            <li className="mb-2">Privacy Policy</li>
                            <li className="mb-2">Disclaimer</li>
                            <li>Refund Policy</li>
                        </ul>
                    </Col>
                </Row>



            </Container>

            <Container className='bootomstrip'>
                <Row>
                    <Col>
                        <div className='Copyright'>
                            Copyright © 2025 rasutrip. All Rights Reserved
                        </div>
                    </Col>

                </Row>
            </Container>
        </footer>
    );
};

export default Footer;
