import React from 'react'
import { Container, Row, Col } from 'react-bootstrap';
import BookingSteps from '../FlightDetails/BookingSteps';
import FareSummary from '../FlightDetails/FareSummary';
import PromoCodeBox from '../FlightDetails/PromoCodeBox';
import { useLocation, useNavigate } from 'react-router-dom';

import '../../Style/Pagescss/FlightResultsPage.css';
import ReviewInfo from './Reviewinfo';


const FlightReview = () => {
 const location = useLocation();
  const { passengerSelections = [], SSR, SelectedFare } = location.state || {};

    return (
        <div>
            <div>
                <Container style={{ marginTop: '8rem' }}>
                    <Row>
                        <div>
                            <BookingSteps activeIndex={3} />
                        </div>
                    </Row>
                    <Row>
                        <Col lg={9}>
                            <div >
                              <ReviewInfo/>
                               
                            </div>

                        </Col>
                        <Col lg={3}>
                            <div>
                                <FareSummary  passengerSelections={passengerSelections} SelectedFare={SelectedFare}  />
                                <PromoCodeBox />

                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </div>
    )
}

export default FlightReview