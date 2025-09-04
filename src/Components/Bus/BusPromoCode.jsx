import React, { useEffect, useState } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { fetchSpecialOffers, applyBusCoupon } from "../APIS/BusApi/BusApis";

const BusPromoCode = ({ totalPrice, onDiscountApplied }) => {
  const [offers, setOffers] = useState([]);
  const [selectedCode, setSelectedCode] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [debugInfo, setDebugInfo] = useState(""); // For debugging

  // Fetch offers from API
  useEffect(() => {
    const loadOffers = async () => {
      try {
        console.log("🔄 Fetching special offers...");
        const data = await fetchSpecialOffers();
        console.log("✅ Special offers received:", data);

        let offersArray = [];
        if (Array.isArray(data)) {
          offersArray = data;
        } else if (data && data.offers && Array.isArray(data.offers)) {
          offersArray = data.offers;
        } else if (data && data.data && Array.isArray(data.data)) {
          offersArray = data.data;
        } else if (data && typeof data === 'object') {
          offersArray = [data];
        }

        console.log("🎯 Processed offers array:", offersArray);
        setOffers(offersArray);

        if (offersArray.length === 0) {
          setMessage("No special offers available at the moment");
        }

      } catch (error) {
        console.error("❌ Failed to load offers:", error);
        setMessage("Failed to load special offers");
        setOffers([]);
      }
    };

    if (totalPrice && totalPrice > 0) {
      loadOffers();
    }
  }, [totalPrice]);



  // Apply coupon function with enhanced debugging and preventing duplicate calls
  const handleApply = async (codeParam = null) => {
    // Prevent multiple simultaneous API calls
    if (loading) {
      console.log("🚫 Already loading, preventing duplicate API call");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setDebugInfo("");

      const appliedCode = codeParam || manualCode;

      // Enhanced debugging
      console.log("🎫 DEBUG - Coupon Application Details:", {
        codeParam,
        manualCode,
        appliedCode,
        totalPrice,
        appliedCodeLength: appliedCode?.length,
        appliedCodeType: typeof appliedCode,
        totalPriceType: typeof totalPrice,
        hasCode: !!appliedCode,
        hasPrice: !!totalPrice && totalPrice > 0
      });

      // Validation
      if (!appliedCode || appliedCode.trim() === "") {
        const errorMsg = "❌ Please enter or select a coupon code.";
        setMessage(errorMsg);
        setDebugInfo("Error: No coupon code provided");
        return;
      }

      if (!totalPrice || totalPrice <= 0) {
        const errorMsg = "❌ Invalid total price for coupon application.";
        setMessage(errorMsg);
        setDebugInfo(`Error: Invalid price - ${totalPrice}`);
        return;
      }

      setDebugInfo(`Applying coupon: ${appliedCode.trim()} for amount: ${totalPrice}`);

      console.log("🚀 DETAILED DEBUG - API Call Parameters:", {
        function: 'applyBusCoupon',
        parameter1: {
          value: appliedCode.trim(),
          type: typeof appliedCode.trim(),
          length: appliedCode.trim().length
        },
        parameter2: {
          value: totalPrice,
          type: typeof totalPrice,
          isNumber: !isNaN(totalPrice)
        }
      });

      const result = await applyBusCoupon(appliedCode.trim(), totalPrice);

      console.log("🎉 Coupon API SUCCESS response:", {
        result,
        type: typeof result,
        success: result?.success,
        hasDiscountAmount: !!result?.discountAmount,
        hasDiscount: !!result?.discount,
        keys: Object.keys(result || {})
      });

      setDebugInfo(`API Response: ${JSON.stringify(result)}`);

      // Enhanced response handling
      if (result && result.success !== false && !result.error) {
        const discount = result.discountAmount ||
          result.discount ||
          result.savedAmount ||
          result.discountValue ||
          (result.discountPercent ? (totalPrice * result.discountPercent) / 100 : 0) ||
          (result.discount_percent ? (totalPrice * result.discount_percent) / 100 : 0);

        console.log("💰 Calculated discount:", {
          discount,
          allDiscountFields: {
            discountAmount: result.discountAmount,
            discount: result.discount,
            savedAmount: result.savedAmount,
            discountValue: result.discountValue,
            discountPercent: result.discountPercent,
            discount_percent: result.discount_percent
          }
        });

        if (discount > 0) {
          setDiscountAmount(discount);
          setAppliedCoupon({
            code: appliedCode.trim(),
            discount: discount,
            type: result.discountType || result.type || 'amount',
            description: result.description || result.message || `${appliedCode} applied successfully`
          });

          if (onDiscountApplied) {
            onDiscountApplied({
              couponCode: appliedCode.trim(),
              discountAmount: discount,
              discountType: result.discountType || result.type || 'amount',
              couponData: result
            });
          }

          setMessage(`✅ Coupon applied successfully! You saved ₹${discount.toFixed(2)}`);
          setSelectedCode(appliedCode.trim());
          setManualCode(appliedCode.trim());
          setDebugInfo(`Success: Discount of ₹${discount.toFixed(2)} applied`);
        } else {
          console.warn("⚠️ No discount calculated from response:", result);
          setMessage("⚠️ Coupon applied but no discount amount received.");
          setDebugInfo("Warning: No discount amount in response");
        }
      } else {
        const errorMsg = result?.message ||
          result?.error ||
          result?.msg ||
          "❌ Invalid or expired coupon.";
        console.error("❌ Coupon application failed:", result);
        setMessage(errorMsg);
        setDebugInfo(`Failed: ${errorMsg}`);
        handleRemoveCoupon();
      }

    } catch (error) {
      console.error("❌ DETAILED ERROR in coupon application:", {
        error,
        message: error?.message,
        name: error?.name,
        stack: error?.stack,
        response: {
          status: error?.response?.status,
          statusText: error?.response?.statusText,
          data: error?.response?.data,
          headers: error?.response?.headers
        },
        request: {
          url: error?.config?.url,
          method: error?.config?.method,
          data: error?.config?.data
        }
      });

      let errorMessage = "Failed to apply coupon. Please try again.";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setMessage(`❌ ${errorMessage}`);
      setDebugInfo(`Error: ${errorMessage} (Status: ${error?.response?.status || 'No status'})`);
      handleRemoveCoupon();
    } finally {
      setLoading(false);
    }
  };

  // Remove applied coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setSelectedCode("");
    setManualCode("");

    if (onDiscountApplied) {
      onDiscountApplied({
        couponCode: null,
        discountAmount: 0,
        discountType: null,
        couponData: null
      });
    }

    setMessage("");
    setDebugInfo("");
  };

  const handleSelectCoupon = (code) => {
    if (appliedCoupon && appliedCoupon.code === code) {
      return;
    }
    console.log("📋 Selected coupon:", code);
    setSelectedCode(code);
    setManualCode(code);
    setMessage("");
    setDebugInfo(`Selected: ${code}`);

    setTimeout(() => {
      handleApply(code);
    }, 100);
  };

  const handleManualCodeChange = (e) => {
    const value = e.target.value.toUpperCase();
    setManualCode(value);
    if (value !== selectedCode) {
      setSelectedCode("");
    }
    setMessage("");
    setDebugInfo(`Typing: ${value}`);
  };

  return (
    <Card className="promo-card shadow-sm mt-3">
      <Card.Header className="">
        Promo Code
        {appliedCoupon && (
          <small className="text-light ms-2">
            (Applied: {appliedCoupon.code})
          </small>
        )}
      </Card.Header>
      <Card.Body className="p-3">

        {/* Applied Coupon Display */}
        {appliedCoupon && (
          <Alert variant="success" className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <strong>🎉 {appliedCoupon.code}</strong>
              <div className="small">Discount: ₹{appliedCoupon.discount.toFixed(2)}</div>
              <div className="small text-muted">{appliedCoupon.description}</div>
            </div>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={handleRemoveCoupon}
            >
              ❌ Remove
            </Button>
          </Alert>
        )}

        {/* Manual Input */}
        {!appliedCoupon && (
          <Form.Group className="mb-3">
            <Form.Label className="promo-label fw-bold">Enter Your Promo Code</Form.Label>
            <div className="promo-input-group d-flex">
              <Form.Control
                type="text"
                placeholder="Enter coupon code (e.g., SAVE10)"
                value={manualCode}
                onChange={handleManualCodeChange}
                disabled={loading}
                style={{ textTransform: 'uppercase' }}
              />
              <Button
                variant="danger"
                className="promo-apply-btn ms-2"
                onClick={() => handleApply()}
                disabled={loading || !manualCode.trim()}
              >
                {loading ? "⏳ Applying..." : "Apply"}
              </Button>
            </div>
          </Form.Group>
        )}

        {/* Special Offers List */}
        {!appliedCoupon && offers.length > 0 && (
          <>
            <div className="offers-container">
              {offers.map((offer, idx) => (
                <div
                  className="promo-option border rounded p-2 mb-2 position-relative"
                  key={idx}
                  onClick={() => handleSelectCoupon(offer.code)}
                >
                  <div className="d-flex align-items-center justify-content-between">
                    <Form.Check
                      type="radio"
                      id={`promo-${idx}`}
                      label={
                        <div>
                          <strong className=""> {offer.code}</strong>
                          <div className="promo-subtext text-muted small">
                            {offer.description || offer.title || 'Special discount offer'}
                          </div>
                          {offer.discountPercent && (
                            <div className="text-success small">
                              💰 {offer.discountPercent}% OFF
                            </div>
                          )}
                          {offer.maxDiscount && (
                            <div className="text-info small">
                              Max discount: ₹{offer.maxDiscount}
                            </div>
                          )}
                        </div>
                      }
                      name="promoCode"
                      value={offer.code}
                      checked={selectedCode === offer.code}
                      onChange={() => handleSelectCoupon(offer.code)}
                      disabled={loading}
                    />
                    <Button
                      size="sm"
                      variant="outline-danger"
                      className="ms-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApply(offer.code);
                      }}
                      disabled={loading}
                    >
                      {loading && selectedCode === offer.code ? "⏳ Applying..." : " Apply Now"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* No offers available */}
        {!appliedCoupon && offers.length === 0 && (
          <div className="text-center text-muted py-3">
            <small>No special offers available at the moment</small>
          </div>
        )}

        {/* Message Display */}
        {message && (
          <div className={`mt-3 p-2 rounded ${message.includes('successfully') || message.includes('saved') || message.includes('✅')
            ? 'text-success bg-success bg-opacity-10'
            : 'text-danger bg-danger bg-opacity-10'
            }`}>
            <small className="fw-bold">{message}</small>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="text-center mt-3">
            <div className="spinner-border spinner-border-sm text-danger me-2" role="status"></div>
            <small className="text-muted">Processing coupon...</small>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default BusPromoCode;