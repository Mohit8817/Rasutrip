import React, { useState } from 'react';

const PromoCodeBox = () => {
  const [promoCode, setPromoCode] = useState('');

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
      <button className="btn-red w-100">Apply</button>
    </div>
  );
};

export default PromoCodeBox;
