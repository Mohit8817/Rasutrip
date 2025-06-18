import React from 'react'
import HotelDetailInfo from './HotelDetailInfo'
import HotelStep from '../HotelStep'
import { Container, Row, Col } from 'react-bootstrap';
import FareSummaryCard from '../FareSummaryCard';
import HotelPromoCodeCard from '../HotelPromoCodeCard ';

const HotelDetail = () => {
    return (
        <div>


            <Container className='mt-5 pt-5'>
                <Row>
                    <HotelStep activeIndex={0}/>
                </Row>
                <Row>
                    <Col lg={9}>
                        <HotelDetailInfo />
                    </Col>
                    <Col lg={3}>
                        <FareSummaryCard/>
                        <HotelPromoCodeCard/>
                    </Col>
                </Row>
            </Container>


        </div>
    )
}

export default HotelDetail