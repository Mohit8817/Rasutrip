import React from 'react'
import { Container, Row, Col } from 'react-bootstrap';
import BookingSteps from '../FlightDetails/BookingSteps';
import FareSummary from '../FlightDetails/FareSummary';
import PromoCodeBox from '../FlightDetails/PromoCodeBox';
import Paymentinfo from './Paymentinfo';

import '../../Style/Pagescss/FlightResultsPage.css';


const FlightPayment = () => {
    return (
        <div>
            <div>
                <Container style={{ marginTop: '8rem' }}>

                    <Row>
                        <div>
                            <BookingSteps activeIndex={4} />
                        </div>
                    </Row>
                    <Row>
                        <Col lg={9}>
                            <div >  

                            <Paymentinfo/>

                            </div>

                        </Col>
                        <Col lg={3}>
                            <div>
                                <FareSummary />
                                <PromoCodeBox />

                            </div>
                        </Col>
                    </Row>
                </Container>
            </div></div>
    )
}

export default FlightPayment