import React, { useState } from 'react';
import { post } from '../APIS/FlightApi/FlightApi';

const PromoCodeBox = () => {
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setResponseMessage("Please enter a promo code.");
      return;
    }

    setLoading(true);
    try {
      const data = { code: promoCode };
      const res = await post(data,'/airservice/apply-coupon');
      setResponseMessage(res?.message || 'Promo code applied successfully!');
    } catch (error) {
      console.error(error);
      setResponseMessage(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="promo-code border p-3 bg-white">
      <h5>Promo Code</h5>
      <input
        type="text"
        className="form-control mb-2"
        placeholder="Enter Your Promo Code"
        value={promoCode}
        onChange={(e) => setPromoCode(e.target.value)}
      />
      <button className="btn-red w-100" onClick={handleApplyPromo} disabled={loading}>
        {loading ? "Applying..." : "Apply"}
      </button>
      {responseMessage && <p className="text-info mt-2">{responseMessage}</p>}
    </div>
  );
};


export default PromoCodeBox;
