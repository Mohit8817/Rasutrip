import React from "react";
import { Card } from "react-bootstrap";

const FareSummaryCard = ({ priceDetails }) => {
  const {
    baseFare = 0,
    cgst = 0,
    sgst = 0,
    discount = 0,
    vendorCommission = 0,
  } = priceDetails || {};

  // FIXED: Use fixed convenience fee instead of calculating from vendorCommission
  const convenienceFee = 150; // Fixed convenience fee in rupees
  
  // Calculate totals
  const subtotal = baseFare + convenienceFee;
  const totalTax = ((subtotal * (cgst + sgst)) / 100);
  const totalPayable = subtotal + totalTax - discount;
  const roundedTotal = parseFloat(totalPayable.toFixed(2));

  // Vendor payment calculation (what we pay to hotel)
  const vendorPayableAmount = baseFare;
  const vendorTax = ((baseFare * (cgst + sgst)) / 100);
  const totalVendorPayment = vendorPayableAmount + vendorTax - discount;
  
  // Our profit
  const ourProfit = roundedTotal - totalVendorPayment;

  return (
    <Card className="mb-3 shadow-sm">
      <Card.Header className="bg-light fw-bold">Fare Summary</Card.Header>
      <Card.Body className="p-3">
        <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
          <span>Base Fare</span>
          <span>₹ {baseFare.toFixed(2)}</span>
        </div>
        
        {/* Show convenience fee */}
        <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
          <span>
            Convenience Fee
            <small className="text-muted d-block">Service charges</small>
          </span>
          <span className="text-success fw-bold">₹ {convenienceFee.toFixed(2)}</span>
        </div>
        
        {/* Show taxes on total amount */}
        {totalTax > 0 && (
          <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
            <span>
              Taxes (GST)
              <small className="text-muted d-block">CGST + SGST on total</small>
            </span>
            <span>₹ {totalTax.toFixed(2)}</span>
          </div>
        )}
        
        {/* Show discount if any */}
        {discount > 0 && (
          <div className="d-flex justify-content-between border-bottom pb-2 mb-2 text-success">
            <span>Discount</span>
            <span>- ₹ {discount.toFixed(2)}</span>
          </div>
        )}
        
        <div className="d-flex justify-content-between fw-bold pt-2 border-top fs-5">
          <span>Total Amount</span>
          <span className="text-danger">₹ {roundedTotal}</span>
        </div>
        
        {/* Revenue breakdown - can be hidden in production */}
        {ourProfit > 0 && (
          <div className="mt-3 p-2 bg-success bg-opacity-10 rounded">
            <small className="text-success fw-bold">
              Revenue: Customer ₹{roundedTotal} | Vendor ₹{totalVendorPayment.toFixed(2)} | Profit ₹{ourProfit.toFixed(2)}
            </small>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default FareSummaryCard;