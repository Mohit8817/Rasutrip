import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';

import HotelStep from '../HotelStep';
import FareSummaryCard from '../FareSummaryCard';
import HotelPaymentInfo from './HotelPaymentInfo';
import HotelPromoCodeCard from '../HotelPromoCodeCard ';

const HotelPayment = () => {
    const location = useLocation();
    const { totalPrice, priceDetails, blockedRoomData } = location.state || {};

    // State to manage applied coupon and discount
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponDiscount, setCouponDiscount] = useState(0);

    // Handle coupon application
    const handleCouponApplied = (couponData) => {
        console.log("Coupon applied successfully:", couponData);
        
        if (couponData && couponData.success !== false) {
            setAppliedCoupon(couponData);
            
            // Calculate discount amount based on coupon type
            const calculateDiscount = () => {
                // Get base fare for discount calculation
                const roomData = blockedRoomData?.HotelRoomsDetails?.[0] || {};
                const priceData = roomData?.Price || {};
                const baseFare = priceData.PublishedPrice || priceDetails?.baseFare || totalPrice || 0;
                
                let discountAmount = 0;
                
                if (couponData.discountType === 'percentage' || couponData.type === 'PERCENTAGE') {
                    const discountPercent = couponData.discount || couponData.value || 0;
                    discountAmount = (baseFare * discountPercent) / 100;
                } else if (couponData.discountType === 'flat' || couponData.type === 'FLAT') {
                    discountAmount = couponData.discount || couponData.value || 0;
                }
                
                // Apply maximum discount limit
                if (couponData.maxDiscount && discountAmount > couponData.maxDiscount) {
                    discountAmount = couponData.maxDiscount;
                }
                
                // Apply minimum order amount check
                if (couponData.minOrderAmount && baseFare < couponData.minOrderAmount) {
                    console.warn('Order amount is below minimum required for coupon');
                    discountAmount = 0;
                }
                
                return Math.max(0, discountAmount);
            };
            
            const discount = calculateDiscount();
            setCouponDiscount(discount);
            
            console.log("Calculated coupon discount:", discount);
        } else {
            // Clear coupon if application failed
            setAppliedCoupon(null);
            setCouponDiscount(0);
        }
    };

    // Handle coupon removal (if needed)
    const handleCouponRemoved = () => {
        setAppliedCoupon(null);
        setCouponDiscount(0);
        console.log("Coupon removed");
    };

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
                        <HotelPaymentInfo 
                            totalPrice={totalPrice} 
                            priceDetails={priceDetails}
                            // Pass coupon data to payment component
                            appliedCoupon={appliedCoupon}
                            couponDiscount={couponDiscount}
                        />
                    </Col>
                    <Col lg={3}>
                        <div className='mt-4'>
                            <FareSummaryCard 
                                priceDetails={priceDetails}
                                blockedRoomData={blockedRoomData}
                                // Pass coupon data to fare summary
                                appliedCoupon={appliedCoupon}
                                couponDiscount={couponDiscount}
                            />
                            
                            <HotelPromoCodeCard
                                enableCouponAPI={true}
                                showCouponStatus={true}
                                onCouponApplied={handleCouponApplied}
                                onCouponRemoved={handleCouponRemoved}
                            />
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default HotelPayment;