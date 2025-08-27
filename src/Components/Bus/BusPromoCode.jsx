import React, { useEffect, useState } from "react";
import { Card, Form, Button } from "react-bootstrap";
import { fetchSpecialOffers, applyBusCoupon } from "../APIS/BusApi/BusApis";

const BusPromoCode = ({ totalPrice }) => {
  const [offers, setOffers] = useState([]);
  const [selectedCode, setSelectedCode] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [message, setMessage] = useState("");

  // 🟢 Fetch offers from API
  useEffect(() => {
    const loadOffers = async () => {
      const data = await fetchSpecialOffers();
      setOffers(data?.offers || []);
    };
    loadOffers();
  }, []);

  // 🟢 Apply coupon function
  const handleApply = async (code) => {
    try {
      const appliedCode = code || manualCode;
      if (!appliedCode) {
        setMessage("⚠ Please enter or select a coupon.");
        return;
      }

      const result = await applyBusCoupon(appliedCode, totalPrice);
      setMessage(result?.message || "Coupon applied successfully ✅");
    } catch (error) {
      setMessage("❌ Invalid or expired coupon.");
    }
  };

  // 🟢 When radio is selected, update both selectedCode + manualCode
  const handleSelectCoupon = (code) => {
    setSelectedCode(code);
    setManualCode(code); // 👈 input me bhi set kar diya
  };

  return (
    <Card className="promo-card shadow-sm mt-3">
      <Card.Header className="promo-header">Promo Code</Card.Header>
      <Card.Body className="p-3">
        {/* Manual Input */}
        <Form.Group className="mb-3">
          <Form.Label className="promo-label">Enter Your Promo Code</Form.Label>
          <div className="promo-input-group">
            <Form.Control
              type="text"
              placeholder="Apply Promo Code"
              value={manualCode}
              onChange={(e) => {
                setManualCode(e.target.value);
                setSelectedCode(""); // agar manually likhe to radio unselect ho
              }}
            />
            <Button
              variant="outline-danger"
              className="promo-apply-btn"
              onClick={() => handleApply()}
            >
              Apply
            </Button>
          </div>
        </Form.Group>

        {/* Special Offers List */}
        {offers.length > 0 && (
          <>
            <h6>Available Offers</h6>
            {offers.map((offer, idx) => (
              <div className="promo-option d-flex align-items-center" key={idx}>
                <Form.Check
                  type="radio"
                  id={`promo-${idx}`}
                  label={
                    <>
                      <strong>{offer.code}</strong>
                      <div className="promo-subtext">{offer.description}</div>
                    </>
                  }
                  name="promoCode"
                  value={offer.code}
                  checked={selectedCode === offer.code}
                  onChange={() => handleSelectCoupon(offer.code)}
                />
                <Button
                  size="sm"
                  variant="link"
                  onClick={() => handleApply(offer.code)}
                >
                  Apply
                </Button>
              </div>
            ))}
          </>
        )}

        {/* Message */}
        {message && <div className="mt-2 text-success">{message}</div>}
      </Card.Body>
    </Card>
  );
};

export default BusPromoCode;
