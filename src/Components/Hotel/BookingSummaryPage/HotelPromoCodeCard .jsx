import React, { useState, useEffect } from "react";
import {
    Card,
    Form,
    Button,
    InputGroup,
    Alert,
    Spinner,
} from "react-bootstrap";
import {
    applyCouponCode,
    fetchSpecialOffers,
} from "../../APIS/HotelApi/HotelAPi";

const HotelPromoCodeCard = ({
    onCouponApplied,
    enableCouponAPI = false,
    showCouponStatus = true,
}) => {
    const [couponCode, setCouponCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [couponStatus, setCouponStatus] = useState(null);
    const [couponMessage, setCouponMessage] = useState("");
    const [couponData, setCouponData] = useState(null);
    const [offers, setOffers] = useState([]);
    const [selectedOffer, setSelectedOffer] = useState(null);

    // ✅ Fetch special offers
    useEffect(() => {
        if (enableCouponAPI) {
            const loadOffers = async () => {
                const res = await fetchSpecialOffers();
                if (res.success) setOffers(res.data);
            };
            loadOffers();
        }
    }, [enableCouponAPI]);

    const handleCouponChange = (e) => {
        setCouponCode(e.target.value);
        setSelectedOffer(null); // manual typing, deselect radio
        if (couponStatus) {
            setCouponStatus(null);
            setCouponMessage("");
        }
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setCouponStatus("error");
            setCouponMessage("Please enter a coupon code");
            return;
        }

        setIsLoading(true);
        setCouponStatus(null);

        try {
            const response = await applyCouponCode(couponCode.trim());

            if (response.success) {
                setCouponStatus("success");
                setCouponMessage(response.message);
                setCouponData(response.data);

                // ✅ Notify parent
                if (onCouponApplied) {
                    onCouponApplied(response.data);
                }
            } else {
                setCouponStatus("error");
                setCouponMessage(response.message);
                setCouponData(null);
            }
        } catch (error) {
            setCouponStatus("error");
            setCouponMessage("Something went wrong. Please try again.");
            console.error("Coupon application error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleApplyCoupon();
        }
    };

    // ✅ Select offer (radio style)
    const handleOfferSelect = (offer) => {
        setSelectedOffer(offer.code);
        setCouponCode(offer.code); // autofill input
        setCouponStatus(null);
        setCouponMessage("");
    };

    return (
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
                            variant="outline-danger"
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
                                "Apply"
                            )}
                        </Button>
                    </InputGroup>

                    {/* ✅ Special Offers - Radio style */}
                    {enableCouponAPI && offers.length > 0 && (
                        <div className="mt-3">
                            {offers.map((offer, idx) => (
                                <Form.Check
                                    key={idx}
                                    type="radio"
                                    id={`offer-${idx}`}
                                    name="special-offer"
                                    className="mb-2"
                                    label={
                                        <div>
                                            <strong>{offer.code}</strong>
                                            <div className="text-muted small">
                                                {offer.title || "Special Discount"}
                                            </div>
                                        </div>
                                    }
                                    checked={selectedOffer === offer.code}
                                    onChange={() => handleOfferSelect(offer)}
                                />
                            ))}
                        </div>
                    )}

                    {/* ✅ Success/Error Messages */}
                    {showCouponStatus && couponStatus && (
                        <Alert
                            variant={couponStatus === "success" ? "success" : "danger"}
                            className="mt-3 mb-0"
                        >
                            <div className="d-flex align-items-center">
                                {couponStatus === "success" ? (
                                    <>
                                        <i className="bi bi-check-circle-fill me-2"></i>
                                        <div>
                                            <strong>Success!</strong> {couponMessage}
                                            {couponData?.discount && (
                                                <div className="mt-1">
                                                    <small>
                                                        Discount: {couponData.discount}
                                                        {couponData.discountType === "percentage" ? "%" : " ₹"}
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
    );
};

export default HotelPromoCodeCard;
