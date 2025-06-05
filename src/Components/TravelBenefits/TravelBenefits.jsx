import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import '../../Style/TravelBenefits.css'; // Your custom CSS file

import iconSupport from '../../assest/icon.png';
import iconDiscount from '../../assest/icon2.png';
import iconService from '../../assest/icon3.png';

const TravelBenefits = () => {
    return (
        <section className="travel-benefits-section">
            <Container>
                <Row className="text-center">
                    <Col md={4} className="benefit-box">
                        <img src={iconSupport} alt="24/7 Support" className="benefit-icon" />
                        <h5 className="benefit-title">24/7 Customer Support</h5>
                        <p className="benefit-text">- For all kind of travel related queries</p>
                    </Col>
                    <Col md={4} className="benefit-box border-start border-end">
                        <img src={iconDiscount} alt="Discounted Deals" className="benefit-icon" />
                        <h5 className="benefit-title">Discounted Deals</h5>
                        <p className="benefit-text">- Worldwide Hotels<br />- Holiday Package</p>
                    </Col>
                    <Col md={4} className="benefit-box">
                        <img src={iconService} alt="Personalized Service" className="benefit-icon" />
                        <h5 className="benefit-title">Personalized Service</h5>
                        <p className="benefit-text">- Curated journeys designed with care<br />- Attention to every detail, every step</p>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default TravelBenefits;
