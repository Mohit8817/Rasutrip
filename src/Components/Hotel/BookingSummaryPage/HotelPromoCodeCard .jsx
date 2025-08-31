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
    enableCouponAPI = true, // Default true to show special offers
    showCouponStatus = true,
}) => {
    const [couponCode, setCouponCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [couponStatus, setCouponStatus] = useState(null);
    const [couponMessage, setCouponMessage] = useState("");
    const [couponData, setCouponData] = useState(null);
    const [offers, setOffers] = useState([]);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [isLoadingOffers, setIsLoadingOffers] = useState(false);

    // ✅ Fetch special offers on component mount
    useEffect(() => {
        if (enableCouponAPI) {
            loadSpecialOffers();
        }
    }, [enableCouponAPI]);

    const loadSpecialOffers = async () => {
        setIsLoadingOffers(true);
        try {
            const response = await fetchSpecialOffers();
            console.log("Full API Response:", response); // Debug log

            if (response.success) {
                // Handle different response structures
                let offersData = response.data || [];

                // If response.data.offers exists, use that
                if (response.data && response.data.offers) {
                    offersData = response.data.offers;
                }

                console.log("Offers Data:", offersData); // Debug log

                // ✅ TEMPORARY FIX: Show all offers for testing
                // TODO: Change this to proper filtering when backend has HOTEL offers
                const hotelOffers = offersData.filter(offer => {
                    // Check if offer is active and not expired
                    const isActive = offer.isActive !== false;
                    const isNotExpired = !offer.endDate || new Date(offer.endDate) > new Date();

                    // TEMPORARY: Show all offers for testing (including FLIGHT/BUS offers)
                    // Production code should be:
                    // const isApplicable = offer.applicableFor === 'HOTEL' || offer.applicableFor === 'ALL';

                    return isActive && isNotExpired; // Show all active offers for now
                });

                console.log("All Available Offers:", hotelOffers); // Debug log
                console.log("Original Offers from API:", offersData.map(o => ({
                    code: o.code,
                    applicableFor: o.applicableFor,
                    isActive: o.isActive
                })));

                setOffers(hotelOffers);
            } else {
                console.error("Failed to load offers:", response.message);
                // If auth error, show message to user
                if (response.authError) {
                    console.warn("Authentication required for special offers");
                }
            }
        } catch (error) {
            console.error("Error loading special offers:", error);
        } finally {
            setIsLoadingOffers(false);
        }
    };

    const handleCouponChange = (e) => {
        setCouponCode(e.target.value);
        setSelectedOffer(null); // Clear selected offer when manually typing
        // Clear previous status when user starts typing
        if (couponStatus) {
            setCouponStatus(null);
            setCouponMessage("");
            setCouponData(null);
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

                // ✅ Notify parent component about successful coupon application
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

    // ✅ Handle special offer selection and auto-apply
    const handleOfferSelect = async (offer) => {
        setSelectedOffer(offer.code);
        setCouponCode(offer.code); // Auto-fill the input field

        // Clear any previous status
        setCouponStatus(null);
        setCouponMessage("");
        setCouponData(null);

        // Auto-apply the coupon when selected
        setIsLoading(true);

        try {
            const response = await applyCouponCode(offer.code);

            if (response.success) {
                setCouponStatus("success");
                setCouponMessage(response.message);
                setCouponData(response.data);

                // ✅ Notify parent component about successful coupon application
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

    return (
        <Card className="shadow-sm">
            <Card.Header className="bg-light fw-bold">
                <i className="bi bi-tag-fill me-2"></i>
                Promo Code & Special Offers
            </Card.Header>
            <Card.Body>
                <Form>
                    <Form.Label className="fw-normal">Enter Your Promo Code</Form.Label>
                    <InputGroup>
                        <Form.Control
                            type="text"
                            placeholder="Enter promo code"
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
                                    {selectedOffer ? 'Applying...' : 'Applying...'}
                                </>
                            ) : (
                                "Apply"
                            )}
                        </Button>
                    </InputGroup>

                    {/* ✅ Special Offers Section */}
                    {enableCouponAPI && (
                        <div className="mt-4">
                            {isLoadingOffers ? (
                                <div className="text-center py-3">
                                    <Spinner animation="border" size="sm" />
                                    <div className="mt-2 text-muted">Loading offers...</div>
                                </div>
                            ) : offers.length > 0 ? (
                                <div className="border rounded p-2" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                    {offers.map((offer, idx) => (
                                        <div
                                            key={idx}
                                            className={`d-flex align-items-center p-2 mb-2 border rounded cursor-pointer transition-all ${selectedOffer === offer.code ? 'bg-light border-danger' : 'border-light hover-shadow'
                                                }`}
                                            style={{
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onClick={() => handleOfferSelect(offer)}
                                            onMouseEnter={(e) => {
                                                if (selectedOffer !== offer.code) {
                                                    e.currentTarget.style.borderColor = '#dc3545';
                                                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (selectedOffer !== offer.code) {
                                                    e.currentTarget.style.borderColor = '#dee2e6';
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                }
                                            }}
                                        >
                                            <Form.Check
                                                type="radio"
                                                id={`offer-${idx}`}
                                                name="special-offer"
                                                checked={selectedOffer === offer.code}
                                                onChange={() => { }} // Handled by parent div click
                                                className="me-3"
                                            />
                                            <div className="flex-grow-1">
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div className="">
                                                        <div className="d-flex align-items-center mb-1">
                                                            <strong className="text-danger me-2">{offer.code}</strong>
                                                            <span className="badge bg-secondary small">{offer.applicableFor}</span>
                                                        </div>
                                                        <div className="text-muted small mb-1">
                                                            {offer.name || offer.description || "Special Discount"}
                                                        </div>
                                                        {offer.value && (
                                                            <div className="d-flex align-items-center">
                                                                <span className="text-success small fw-bold me-2">
                                                                    Save {offer.value}
                                                                    {offer.type === 'PERCENTAGE' ? '%' : ' ₹'}
                                                                </span>
                                                                {offer.type === 'FLAT' && (
                                                                    <span className="badge bg-success-subtle text-success-emphasis small">
                                                                        Flat Discount
                                                                    </span>
                                                                )}
                                                                {offer.type === 'PERCENTAGE' && (
                                                                    <span className="badge bg-primary-subtle text-primary-emphasis small">
                                                                        Percentage Off
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {offer.endDate && (
                                                        <small className="text-muted text-end">
                                                            <div>Valid till:</div>
                                                            <div className="fw-bold">
                                                                {new Date(offer.endDate).toLocaleDateString('en-IN', {
                                                                    day: '2-digit',
                                                                    month: 'short',
                                                                    year: 'numeric'
                                                                })}
                                                            </div>
                                                        </small>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-muted border rounded bg-light">
                                    <i className="bi bi-info-circle me-2"></i>
                                    <div>No hotel offers available at the moment</div>
                                    <small className="d-block mt-1">
                                        Check back later for exciting deals!
                                    </small>
                                </div>
                            )}
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
                                        <div className="flex-grow-1">
                                            <strong>Success!</strong> {couponMessage}
                                            {couponData?.discount && (
                                                <div className="mt-1">
                                                    <small className="fw-bold text-success">
                                                        Discount Applied: {couponData.discount}
                                                        {couponData.discountType === "percentage" ? "%" : " ₹"}
                                                    </small>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-exclamation-circle-fill me-2"></i>
                                        <div>
                                            <strong>Error!</strong> {couponMessage}
                                        </div>
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