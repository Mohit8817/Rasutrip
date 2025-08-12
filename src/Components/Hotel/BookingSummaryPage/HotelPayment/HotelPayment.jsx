import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';

import HotelStep from '../HotelStep';
import HotelPromoCodeCard from '../HotelPromoCodeCard ';
import FareSummaryCard from '../FareSummaryCard';
import HotelPaymentInfo from './HotelPaymentInfo';

const HotelPayment = () => {
    const location = useLocation();
    const { totalPrice, priceDetails } = location.state || {};

    return (
        <div>
            <Container className="">
                <Row>
                    <Col>
                        <HotelStep activeIndex={3} />
                    </Col>
                </Row>

                <Row>
                    <Col lg={9}>
                       <HotelPaymentInfo totalPrice={totalPrice} priceDetails={priceDetails} />

                    </Col>
                    <Col lg={3}>
                      <div className='mt-4'>
                          <FareSummaryCard priceDetails={priceDetails} />
                        <HotelPromoCodeCard />
                      </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default HotelPayment;
