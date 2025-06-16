import React from 'react'
import { Container, Row, Col } from 'react-bootstrap';
import BookingSteps from '../FlightDetails/BookingSteps';
import FareSummary from '../FlightDetails/FareSummary';
import PromoCodeBox from '../FlightDetails/PromoCodeBox';
import TravellerInfo from './TravellerInfo';


const FlightTravellerDetails = () => {
    return (
        <div>
            <Container style={{ marginTop: '8rem' }}>
          
                <Row>
                    <div>
                        <BookingSteps activeIndex={1} />
                    </div>
                </Row>
                <Row>
                    <Col lg={9}>
                        <div >
                            {/* <FlightInfo /> */}
                            <TravellerInfo />
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
        </div>
    )
}

export default FlightTravellerDetails