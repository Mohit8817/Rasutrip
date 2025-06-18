import React from 'react'
import HotelStep from '../HotelStep'
import { Container, Row, Col } from 'react-bootstrap';
import FareSummaryCard from '../FareSummaryCard';
import HotelPromoCodeCard from '../HotelPromoCodeCard ';
import HotelReviewInfo from './HotelReviewInfo';

const HotelReview = () => {
    return (
        <div>

            <Container className='mt-5 pt-5'>
                <Row>
                    <HotelStep activeIndex={2} />
                </Row>
                <Row>
                    <Col lg={9}>
                        <HotelReviewInfo />
                    </Col>
                    <Col lg={3}>
                        <FareSummaryCard />
                        <HotelPromoCodeCard />
                    </Col>
                </Row>
            </Container>


        </div>
    )
}

export default HotelReview