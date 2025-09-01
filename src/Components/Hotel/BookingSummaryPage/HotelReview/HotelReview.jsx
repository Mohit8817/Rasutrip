import React from 'react'
import HotelStep from '../HotelStep'
import { Container, Row, Col } from 'react-bootstrap';
import FareSummaryCard from '../FareSummaryCard';
import HotelPromoCodeCard from '../HotelPromoCodeCard ';
import HotelReviewInfo from './HotelReviewInfo';
import { useLocation } from 'react-router-dom';


const HotelReview = () => {

    const location = useLocation();
    const { priceDetails } = location.state || {};

    return (
        <div>

            <Container className=''>
                <Row>
                    <HotelStep activeIndex={2} />
                </Row>
                <Row>
                    <Col lg={9} className='p-0 m-0'>
                        <HotelReviewInfo />
                    </Col>
                    <Col lg={3} className='mt-4'>
                        <FareSummaryCard priceDetails={priceDetails} />
                
                    </Col>
                </Row>
            </Container>


        </div>
    )
}

export default HotelReview