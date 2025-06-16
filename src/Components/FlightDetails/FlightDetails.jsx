import React from 'react'
import { Container, Row, Col } from 'react-bootstrap';
import BookingSteps from './BookingSteps'
import FlightInfo from './FlightInfo'
import ContinueBookingButton from './ContinueBookingButton'
import FareSummary from './FareSummary'
import PromoCodeBox from './PromoCodeBox'


const FlightDetails = () => {
    return (
        <div>

            <Container style={{ marginTop: '8rem'}}>
                <Row>
                    <div>
                        <BookingSteps activeIndex={0} />
                    </div>
                </Row>
                <Row>
                    <Col lg={9}>
                        <div >
                            <FlightInfo />
                            <ContinueBookingButton />
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

export default FlightDetails