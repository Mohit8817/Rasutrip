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
  console.log("🏷️ FareSummary - priceDetails:", priceDetails);

  // ✅ Extract prices from blocked room API response (source of truth)
  const finalRoomPrice = priceData.RoomPrice || 0;
  const finalPublishedPrice = priceData.PublishedPrice || priceDetails?.baseFare || 0;
  const finalOfferedPrice = priceData.OfferedPrice || 0;
  const finalTax = priceData.Tax || priceDetails?.tax || 0;
  const finalDiscount = priceData.Discount || priceDetails?.discount || 0;
  const finalServiceCharges = priceData.ServiceCharges || priceDetails?.serviceCharges || 0;
  const finalOtherCharges = priceData.OtherCharges || priceDetails?.otherCharges || 0;
  const agentCommission = priceData.AgentCommission || 0;
  const tds = priceData.TDS || 0;

  // GST data from blocked room response
  const gstData = priceData.GST || {};
  const cgstAmount = gstData.CGSTAmount || 0;
  const sgstAmount = gstData.SGSTAmount || 0;
  const igstAmount = gstData.IGSTAmount || 0;
  const cgstRate = gstData.CGSTRate || 0;
  const sgstRate = gstData.SGSTRate || 0;
  const igstRate = gstData.IGSTRate || 0;

  // Use the published price from blocked room API as the main price
  const actualBaseFare = finalPublishedPrice;

  console.log("Price fields from API:", {
    roomPrice: finalRoomPrice,
    publishedPrice: finalPublishedPrice,
    offeredPrice: finalOfferedPrice,
    tax: finalTax,
    agentCommission,
    tds,
    serviceCharges: finalServiceCharges,
    otherCharges: finalOtherCharges,
    discount: finalDiscount
  });

  // Calculate vendor commission if not available from API
  const vendorCommissionPercentage = priceDetails?.vendorCommissionPercentage || 12;
  const vendorCommissionAmount = agentCommission || (actualBaseFare * vendorCommissionPercentage) / 100;

  // Calculate total GST
  let totalGST = cgstAmount + sgstAmount + igstAmount;
  if (totalGST === 0 && (cgstRate > 0 || sgstRate > 0 || igstRate > 0)) {
    const gstBase = actualBaseFare + vendorCommissionAmount;
    totalGST = (gstBase * (cgstRate + sgstRate + igstRate)) / 100;
  }

  // Get coupon discount
  const finalCouponDiscount = couponDiscount || priceDetails?.couponDiscount || priceDetails?.appliedCouponDiscount || 0;
  const finalAppliedCoupon = appliedCoupon || priceDetails?.couponData;

  // Calculate final amounts
  const subtotal = actualBaseFare + finalTax + vendorCommissionAmount + finalServiceCharges + finalOtherCharges + totalGST - finalDiscount;
  const customerTotal = Math.max(0, subtotal - finalCouponDiscount);
  const roundedTotal = parseFloat(customerTotal.toFixed(2));

  console.log("Price Breakdown:", {
    roomPrice: finalRoomPrice,
    publishedPrice: actualBaseFare,
    offeredPrice: finalOfferedPrice,
    tax: finalTax,
    agentCommission,
    vendorCommissionAmount,
    tds,
    totalGST,
    serviceCharges: finalServiceCharges,
    otherCharges: finalOtherCharges,
    discount: finalDiscount,
    finalCouponDiscount,
    subtotal,
    customerTotal,
    roundedTotal
  });

  return (
    <Card className="mb-3 shadow-sm">
      <Card.Header className="bg-light fw-bold">Fare Summary</Card.Header>
      <Card.Body className="p-3">

        {/* Room Price (Base price from hotel) */}
        {finalRoomPrice > 0 && (
          <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
            <span>Room Price</span>
            <span>₹ {finalRoomPrice.toLocaleString()}</span>
          </div>
        )}

        {/* Published Price (Main price for payment) */}
        <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
          <span>Published Price</span>
          <span>₹ {actualBaseFare.toLocaleString()}</span>
        </div>

        {/* Offered Price (if different from published) */}
        {finalOfferedPrice > 0 && finalOfferedPrice !== actualBaseFare && (
          <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
            <span>Offered Price</span>
            <span>₹ {finalOfferedPrice.toLocaleString()}</span>
          </div>
        )}

        {/* Taxes */}
        {finalTax > 0 && (
          <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
            <span>Taxes</span>
            <span>₹ {finalTax.toFixed(2)}</span>
          </div>
        )}

        {/* Service Charges */}
        {finalServiceCharges > 0 && (
          <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
            <span>Service Charges</span>
            <span>₹ {finalServiceCharges.toFixed(2)}</span>
          </div>
        )}

        {/* Other Charges */}
        {finalOtherCharges > 0 && (
          <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
            <span>Other Charges</span>
            <span>₹ {finalOtherCharges.toFixed(2)}</span>
          </div>
        )}

        {/* GST */}
        {totalGST > 0 && (
          <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
            <span>GST (+)</span>
            <span>₹ {totalGST.toFixed(2)}</span>
          </div>
        )}

        {/* Agent Commission (Your Commission) */}
        {vendorCommissionAmount > 0 && (
          <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
            <span>Convenience Fee</span>
            <span>₹ {vendorCommissionAmount.toFixed(2)}</span>
          </div>
        )}

        {/* TDS */}
        {tds > 0 && (
          <div className="d-flex justify-content-between border-bottom pb-2 mb-2 text-info">
            <span>TDS</span>
            <span>₹ {tds.toFixed(2)}</span>
          </div>
        )}

        {/* Discount (if any) */}
        {finalDiscount > 0 && (
          <div className="d-flex justify-content-between border-bottom pb-2 mb-2 text-success">
            <span>Discount (-)</span>
            <span>- ₹ {finalDiscount.toFixed(2)}</span>
          </div>
        )}

        {/* Coupon Discount */}
        {finalCouponDiscount > 0 && (
          <div className="d-flex justify-content-between border-bottom pb-2 mb-2 text-success">
            <span>
              Coupon Discount (-)
              {finalAppliedCoupon && (
                <small className="text-muted d-block">
                  {finalAppliedCoupon.code || finalAppliedCoupon.couponCode}
                </small>
              )}
            </span>
            <span>- ₹ {finalCouponDiscount.toFixed(2)}</span>
          </div>
        )}

        {/* Total Payable */}
        <div className="d-flex justify-content-between fw-bold pt-2 border-top fs-5 bg-light p-2 rounded">
          <span>Total Payable</span>
          <span className="text-danger">₹ {roundedTotal.toLocaleString()}</span>
        </div>

        {/* Savings message if coupon applied */}
        {finalCouponDiscount > 0 && (
          <div className="mt-2 text-center">
            <small className="text-success">
              <i className="bi bi-check-circle-fill me-1"></i>
              You saved ₹{finalCouponDiscount.toFixed(2)} with coupon!
            </small>
          </div>
        )}

        {/* Price breakdown note */}
        <div className="mt-3 text-center">
          <small className="text-muted">
            Final prices confirmed from booking API
          </small>
        </div>

      </Card.Body>
    </Card>
  );
};

export default FareSummaryCard;