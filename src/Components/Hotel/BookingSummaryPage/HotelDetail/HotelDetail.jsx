import React, { useState } from 'react';
import HotelDetailInfo from './HotelDetailInfo';
import HotelStep from '../HotelStep';
import { Container, Row, Col } from 'react-bootstrap';
import FareSummaryCard from '../FareSummaryCard';
import HotelPromoCodeCard from '../HotelPromoCodeCard ';

const HotelDetail = () => {
    const [selectedPrice, setSelectedPrice] = useState(null);

    const handleRoomSelect = (priceData) => {
        setSelectedPrice(priceData);
    };

    return (
        <Container className='mt-5 pt-5'>
            <Row>
                <HotelStep activeIndex={0} />
            </Row>

            <Row>
                <Col lg={9}>
                    <HotelDetailInfo onRoomSelect={handleRoomSelect} />
                </Col>

                <Col lg={3}>
                    <FareSummaryCard priceDetails={selectedPrice} />

                    <HotelPromoCodeCard />
                </Col>
            </Row>
        </Container>
    );
};

export default HotelDetail;
