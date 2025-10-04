import React from "react";
import { Card } from "react-bootstrap";

const FareSummaryCard = ({
  priceDetails,
  blockedRoomData,
  appliedCoupon = null,
  couponDiscount = 0
}) => {
  // Get data from blocked room response if available
  const roomData = blockedRoomData?.[0] || {};
  const priceData = roomData?.Price || {};

  console.log("🏷️ FareSummary - blockedRoomData:", blockedRoomData);
  console.log("🏷️ FareSummary - priceData:", priceData);

  // Extract prices from blocked room API response
  const finalRoomPrice = priceData.RoomPrice || 0;
  const finalPublishedPrice = priceData.PublishedPrice || priceDetails?.baseFare || 0;
  const finalTax = priceData.Tax || priceDetails?.tax || 0;
  const finalDiscount = priceData.Discount || priceDetails?.discount || 0;
  const finalServiceCharges = priceData.ServiceCharges || priceDetails?.serviceCharges || 0;
  const finalOtherCharges = priceData.OtherCharges || priceDetails?.otherCharges || 0;
  const agentCommission = priceData.AgentCommission || 0;
  const tds = priceData.TDS || 0;

  // GST data
  const gstData = priceData.GST || {};
  const cgstAmount = gstData.CGSTAmount || 0;
  const sgstAmount = gstData.SGSTAmount || 0;
  const igstAmount = gstData.IGSTAmount || 0;
  const igstRate = gstData.IGSTRate || 0;

  let totalGST = cgstAmount + sgstAmount + igstAmount;

  // Main price
  const mainPrice = finalPublishedPrice;

  // Vendor Commission - ONLY amount to add
  const vendorCommissionPercentage = priceDetails?.vendorCommissionPercentage || 0;
  const vendorCommissionAmount = priceDetails?.vendorCommission ||
    (agentCommission || ((mainPrice * vendorCommissionPercentage) / 100));

  // Calculate final amount
  let finalAmount = mainPrice + vendorCommissionAmount - finalDiscount - (couponDiscount || 0);
  finalAmount = Math.max(0, finalAmount);

  console.log("💰 Final Calculation:", {
    mainPrice,
    vendorCommission: vendorCommissionAmount,
    discount: finalDiscount,
    couponDiscount,
    finalAmount
  });

  return (
    <Card className="border-0 shadow-sm">
      <Card.Header
        className="bg-white border-bottom fw-semibold py-3"
        style={{ fontSize: '18px', color: '#333' }}
      >
        Fare Summary
      </Card.Header>

      <Card.Body className="p-0">
        <div className="px-4">

          {/* Base Fare */}
          <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
            <span >Base Fare</span>
            <span >₹ {mainPrice.toFixed(2)}</span>
          </div>

          {/* Service Charges */}
          <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
            <span >Service Charges</span>
            <span >₹ {finalServiceCharges.toFixed(2)}</span>
          </div>

          {/* Tax */}
          <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
            <span >Tax</span>
            <span >₹ {finalTax.toFixed(2)}</span>
          </div>

          {/* Other Charges */}
          <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
            <span >Other Charges</span>
            <span >₹ {finalOtherCharges.toFixed(2)}</span>
          </div>



          {/* GST */}
          <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
            <span >GST</span>
            <span >
              {igstRate > 0 ? `${igstRate}%` : '0%'}
            </span>
          </div>

          {/* Convenience Fee */}
          <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
            <span >Convenience Fee</span>
            <span >₹ {vendorCommissionAmount.toFixed(2)}</span>
          </div>

          {/* Coupon Discount */}
          {couponDiscount > 0 && (
            <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
              <div>
                <span style={{ color: '#28a745', fontSize: '15px' }}>Coupon Discount (-)</span>
                {appliedCoupon && (
                  <div>
                    <small className="text-muted d-block" style={{ fontSize: '12px' }}>
                      Code: {appliedCoupon.code || appliedCoupon.couponCode}
                    </small>
                  </div>
                )}
              </div>
              <span style={{ color: '#28a745', fontSize: '15px' }}>- ₹ {couponDiscount.toFixed(2)}</span>
            </div>
          )}

        </div>

        {/* Total Amount */}
        <div
          className="px-4 py-3"
          style={{ backgroundColor: '#f8f9fa' }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <span className="fw-bold" style={{ fontSize: '17px', color: '#000' }}>
              Total Amount
            </span>
            <span className="fw-bold" style={{ fontSize: '17px', color: '#000' }}>
              ₹ {finalAmount.toFixed(2)}
            </span>
          </div>
        </div>

      </Card.Body>
    </Card>
  );
};

export default FareSummaryCard;