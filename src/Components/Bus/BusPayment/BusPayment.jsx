import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import BusFareSummary from '../BusFareSummary';
import BusPromoCode from '../BusPromoCode';
import BusStep from '../BusStep';
import { useLocation } from 'react-router-dom';
import BusPaymentInfo from './BusPaymentInfo';

const BusPayment = () => {
    const location = useLocation();
    const { travellerInfo, totalPrice } = location.state || {};
    
    // State to manage coupon discount
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [appliedCouponData, setAppliedCouponData] = useState(null);

    // Handle discount application from BusPromoCode
    const handleDiscountApplied = (discountData) => {
        console.log("Discount applied in BusPayment:", discountData);
        
        if (discountData && discountData.discountAmount > 0) {
            setCouponDiscount(discountData.discountAmount);
            setAppliedCouponData({
                code: discountData.couponCode,
                discount: discountData.discountAmount,
                type: discountData.discountType,
                data: discountData.couponData
            });
        } else {
            // Coupon removed or invalid
            setCouponDiscount(0);
            setAppliedCouponData(null);
        }
    };

    // Calculate final price after discount
    const finalPrice = Math.max(0, (totalPrice || 0) - couponDiscount);

    console.log("BusPayment render:", {
        totalPrice,
        couponDiscount,
        finalPrice,
        appliedCouponData
    });

    return (
        <div>
            <Container className='mt-5'>
                <Row>
                    <Col>
                        <BusStep activeIndex={3} />
                    </Col>
                </Row>

                <Row>
                    <Col lg={9}>
                        <BusPaymentInfo 
                            couponDiscount={couponDiscount}
                            appliedCouponData={appliedCouponData}
                        />
                    </Col>
                    <Col lg={3}>
                        <BusFareSummary     
                            totalPrice={totalPrice}
                            couponDiscount={couponDiscount}
                            appliedCouponData={appliedCouponData}
                        />
                        <BusPromoCode 
                            totalPrice={totalPrice}
                            onDiscountApplied={handleDiscountApplied}
                        />
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default BusPayment;