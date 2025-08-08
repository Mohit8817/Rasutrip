import React, { useState } from 'react';
import HotelDetailInfo from './HotelDetailInfo';
import HotelStep from '../HotelStep';
import { Container, Row, Col } from 'react-bootstrap';
import FareSummaryCard from '../FareSummaryCard';
import HotelPromoCodeCard from '../HotelPromoCodeCard ';
import { useLocation } from "react-router-dom";


const HotelDetail = () => {
    const [selectedPrice, setSelectedPrice] = useState(null);

    const handleRoomSelect = (priceData) => {
        setSelectedPrice(priceData);
    };

    const location = useLocation();
    const { priceDetails } = location.state || {};

    return (
        <Container className=''>
            <Row>
                <HotelStep activeIndex={0} />
            </Row>

            <Row className='mt-3'>
                <Col lg={9}>
                    <HotelDetailInfo onRoomSelect={handleRoomSelect} />
                </Col>

                <Col lg={3}>
                    <FareSummaryCard priceDetails={priceDetails} />

                    <HotelPromoCodeCard />
                </Col>
            </Row>
        </Container>
    );
};

export default HotelDetail;
