import React, { useState } from 'react';
import HotelDetailInfo from './HotelDetailInfo';
import HotelStep from '../HotelStep';
import { Container, Row, Col } from 'react-bootstrap';
import FareSummaryCard from '../FareSummaryCard';
import HotelPromoCodeCard from '../HotelPromoCodeCard ';
import { useLocation } from "react-router-dom";

const HotelDetail = () => {
    const [selectedPrice, setSelectedPrice] = useState(null);

    // State to handle applied coupon
    const [appliedCoupon, setAppliedCoupon] = useState(null);

    const handleRoomSelect = (priceData) => {
        setSelectedPrice(priceData);
    };

    // Handle coupon application
    const handleCouponApplied = (couponData) => {
        setAppliedCoupon(couponData);
        console.log('Coupon applied in HotelDetail:', couponData);

        // Optional: You can also update selectedPrice with discount
        if (selectedPrice && couponData) {
            const discountAmount = calculateDiscount(selectedPrice.totalAmount, couponData);
            console.log('Discount amount:', discountAmount);
        }
    };

    // Helper function to calculate discount
    const calculateDiscount = (totalAmount, couponData) => {
        if (!couponData || !totalAmount) return 0;

        if (couponData.discountType === 'percentage') {
            return (totalAmount * couponData.discount) / 100;
        } else if (couponData.discountType === 'fixed') {
            return Math.min(couponData.discount, totalAmount);
        }
        return 0;
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
                    <FareSummaryCard
                        priceDetails={priceDetails}
                        selectedPrice={selectedPrice}
                        appliedCoupon={appliedCoupon}
                    />

                    <HotelPromoCodeCard
                        enableCouponAPI={true}
                        onCouponApplied={handleCouponApplied}
                        showCouponStatus={true}
                    />
                </Col>
            </Row>
        </Container>
    );
};

export default HotelDetail;