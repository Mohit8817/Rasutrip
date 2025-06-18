import React from 'react'
import HotelStep from '../HotelStep'
import { Container, Row, Col } from 'react-bootstrap';
import FareSummaryCard from '../FareSummaryCard';
import HotelPromoCodeCard from '../HotelPromoCodeCard ';
import GuestDetailsInfo from './GuestDetailsInfo';

const GuestDetails = () => {
    return (
        <div>

            <Container className='mt-5 pt-5'>
                <Row>
                    <HotelStep activeIndex={1} />
                </Row>
                <Row>
                    <Col lg={9}>
                    <GuestDetailsInfo/>
                    </Col>
                    <Col lg={3}>
                        {/* <FareSummaryCard /> */}
                        {/* <HotelPromoCodeCard /> */}
                        <FareSummaryCard/>
                        <HotelPromoCodeCard/>
                    </Col>
                </Row>
            </Container></div>
    )
}

export default GuestDetails