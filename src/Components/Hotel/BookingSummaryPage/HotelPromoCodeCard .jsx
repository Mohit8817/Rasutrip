import React, { useState } from "react";
import { Card, Form, Button, InputGroup, Alert, Spinner } from "react-bootstrap";
import { applyCouponCode } from "../../APIS/HotelApi/HotelAPi";

const HotelPromoCodeCard = () => {
    const [couponCode, setCouponCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [couponStatus, setCouponStatus] = useState(null); // null, 'success', 'error'
    const [couponMessage, setCouponMessage] = useState("");
    const [couponData, setCouponData] = useState(null);

    // Handle coupon code input change
    const handleCouponChange = (e) => {
        setCouponCode(e.target.value);
        // Clear previous status when user types
        if (couponStatus) {
            setCouponStatus(null);
            setCouponMessage("");
        }
    };

    // Handle apply coupon button click
    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setCouponStatus('error');
            setCouponMessage('Please enter a coupon code');
            return;
        }

        setIsLoading(true);
        setCouponStatus(null);

        try {
            const response = await applyCouponCode(couponCode.trim());

            if (response.success) {
                setCouponStatus('success');
                setCouponMessage(response.message);
                setCouponData(response.data);

                // Optional: Call parent component callback to handle coupon data
                // if (onCouponApplied) {
                //     onCouponApplied(response.data);
                // }
            } else {
                setCouponStatus('error');
                setCouponMessage(response.message);
                setCouponData(null);
            }
        } catch (error) {
            setCouponStatus('error');
            setCouponMessage('Something went wrong. Please try again.');
            console.error('Coupon application error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle enter key press in input field
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleApplyCoupon();
        }
    };

    return (
        <div>
            <Card className="shadow-sm">
                <Card.Header className="bg-light fw-bold">Promo Code</Card.Header>
                <Card.Body>
                    <Form>
                        <Form.Label className="fw-normal">Enter Your Promo Code</Form.Label>
                        <InputGroup>
                            <Form.Control
                                type="text"
                                placeholder="Apply Promo Code"
                                className="rounded-0"
                                value={couponCode}
                                onChange={handleCouponChange}
                                onKeyPress={handleKeyPress}
                                disabled={isLoading}
                            />
                            <Button
                                variant="outline-secondary"
                                className="rounded-0"
                                onClick={handleApplyCoupon}
                                disabled={isLoading || !couponCode.trim()}
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                            className="me-1"
                                        />
                                        Applying...
                                    </>
                                ) : (
                                    'Apply'
                                )}
                            </Button>
                        </InputGroup>

                        {/* Success/Error Messages */}
                        {couponStatus && (
                            <Alert
                                variant={couponStatus === 'success' ? 'success' : 'danger'}
                                className="mt-3 mb-0"
                            >
                                <div className="d-flex align-items-center">
                                    {couponStatus === 'success' ? (
                                        <>
                                            <i className="bi bi-check-circle-fill me-2"></i>
                                            <div>
                                                <strong>Success!</strong> {couponMessage}
                                                {couponData?.discount && (
                                                    <div className="mt-1">
                                                        <small>
                                                            Discount: {couponData.discount}
                                                            {couponData.discountType === 'percentage' ? '%' : ' ₹'}
                                                        </small>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-exclamation-circle-fill me-2"></i>
                                            <strong>Error!</strong> {couponMessage}
                                        </>
                                    )}
                                </div>
                            </Alert>
                        )}
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default HotelPromoCodeCard;