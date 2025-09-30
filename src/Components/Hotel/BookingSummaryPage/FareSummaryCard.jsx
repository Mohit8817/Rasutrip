import React from "react";
import { Card } from "react-bootstrap";

const FareSummaryCard = ({
  priceDetails,
  blockedRoomData,
  // ✅ ENHANCED: Receive coupon data from parent component
  appliedCoupon = null,
  couponDiscount = 0,
}) => {
  // Get data from blocked room response if available
  const roomData = blockedRoomData?.[0] || {};
  const priceData = roomData?.Price || {};

  console.log("🏷️ FareSummary - blockedRoomData:", blockedRoomData);
  console.log("🏷️ FareSummary - priceData:", priceData);
  console.log("🏷️ FareSummary - appliedCoupon:", appliedCoupon);
  console.log("🏷️ FareSummary - couponDiscount:", couponDiscount);

  // ✅ Extract prices from blocked room API response (source of truth)
  const finalRoomPrice = priceData.RoomPrice || 0;
  const finalPublishedPrice =
    priceData.PublishedPrice || priceDetails?.baseFare || 0;
  const finalTax = priceData.Tax || priceDetails?.tax || 0;
  const finalDiscount = priceData.Discount || priceDetails?.discount || 0;
  const finalServiceCharges =
    priceData.ServiceCharges || priceDetails?.serviceCharges || 0;
  const finalOtherCharges =
    priceData.OtherCharges || priceDetails?.otherCharges || 0;
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

  // Calculate vendor commission if not available from API
  const vendorCommissionPercentage =
    priceDetails?.vendorCommissionPercentage || 12;
  const vendorCommissionAmount =
    agentCommission || (actualBaseFare * vendorCommissionPercentage) / 100;

  // Calculate total GST
  let totalGST = cgstAmount + sgstAmount + igstAmount;
  if (totalGST === 0 && (cgstRate > 0 || sgstRate > 0 || igstRate > 0)) {
    const gstBase = actualBaseFare + vendorCommissionAmount;
    totalGST = (gstBase * (cgstRate + sgstRate + igstRate)) / 100;
  }

  // ✅ CORRECTED: New calculation logic matching the payment component
  // STEP 1: Calculate subtotal with all charges BEFORE any discounts
  const subtotalBeforeDiscounts =
    actualBaseFare +
    finalTax +
    vendorCommissionAmount +
    finalServiceCharges +
    finalOtherCharges +
    totalGST +
    tds;

  // STEP 2: Apply hotel discount first (if any)
  const subtotalAfterHotelDiscount = subtotalBeforeDiscounts - finalDiscount;

  // STEP 3: Apply coupon discount to the final amount
  const finalCouponDiscount = couponDiscount || 0;
  const finalAmountAfterCoupon = Math.max(
    0,
    subtotalAfterHotelDiscount - finalCouponDiscount
  );

  // Final customer amount
  const customerTotal = finalAmountAfterCoupon;
  const roundedTotal = parseFloat(customerTotal.toFixed(2));

  console.log("💰 CORRECTED FareSummary Price Breakdown:", {
    step1_subtotalBeforeDiscounts: subtotalBeforeDiscounts,
    step2_hotelDiscount: finalDiscount,
    step2_subtotalAfterHotelDiscount: subtotalAfterHotelDiscount,
    step3_couponDiscount: finalCouponDiscount,
    step3_finalAmountAfterCoupon: finalAmountAfterCoupon,
    finalCustomerTotal: customerTotal,
    roundedTotal,
  });

  return (
    <Card className="mb-3 shadow-sm">
      <Card.Header className="bg-light fw-bold">Fare Summary</Card.Header>
      <Card.Body className="p-3">
        {/* Room Price (Base price from hotel) */}
        {/* {finalRoomPrice > 0 && (
          <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
            <span>Room Price</span>
            <span>₹ {finalRoomPrice.toLocaleString()}</span>
          </div>
        )} */}
        {/* Published Price (Main price for payment) */}
        <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
          <span>Base Fare</span>
          <span>
            {/* ₹ {actualBaseFare.toLocaleString()} */}₹{" "}
            {Number(actualBaseFare).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        {/* Taxes */}
        {/* {finalTax > 0 && (
          <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
            <span>Taxes</span>
            <span>₹ {finalTax.toFixed(2)}</span>
          </div>
        )} */}
        {/* Taxes */}
        <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
          <span>Taxes</span>
          <span>
            ₹{" "}
            {Number(finalTax).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        {/* Service Charges */}
        {/* {finalServiceCharges > 0 && (
          <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
            <span>Service Charges</span>
            <span>₹ {finalServiceCharges.toFixed(2)}</span>
          </div>
        )} */}
        <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
          <span>Service Charges</span>
          <span>
            ₹{" "}
            {Number(finalServiceCharges).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        {/* Other Charges */}
        {/* {finalOtherCharges > 0 && (
          <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
            <span>Other Charges</span>
            <span>₹ {finalOtherCharges.toFixed(2)}</span>
          </div>
        )} */}
        <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
          <span>Other Charges</span>
          <span>
            ₹{" "}
            {Number(finalOtherCharges).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        {/* Convenience Fee (Your Commission) */}
        {/* {vendorCommissionAmount > 0 && (
          <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
            <span>Convenience Fee</span>
            <span>₹ {vendorCommissionAmount.toFixed(2)}</span>
          </div>
        )} */}
        <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
          <span>Convenience Fee</span>
          <span>
            {/* ₹{" "}
            {Number(vendorCommissionAmount).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} */}
            ₹{" "}
            {Number(vendorCommissionAmount).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        {/* GST */}
        {/* {totalGST > 0 && (
          <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
            <span>GST (+)</span>
            <span>₹ {totalGST.toFixed(2)}</span>
          </div>
        )} */}
        {/* <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
          <span>GST (+)</span>
          <span>18%</span>
        </div> */}

        {/* TDS */}
        {/* {tds > 0 && (
          <div className="d-flex justify-content-between border-bottom pb-2 mb-2 text-info">
            <span>TDS</span>
            <span>₹ {tds.toFixed(2)}</span>
          </div>
        )} */}
        {/* ✅ CORRECTED: Show subtotal before ANY discounts */}
        {/* <div className="d-flex justify-content-between border-bottom pb-2 mb-2 fw-bold">
          <span>Subtotal</span>
          <span>₹ {subtotalBeforeDiscounts.toFixed(2)}</span>
        </div> */}
        {/* Hotel Discount (if any) - Applied FIRST */}
        {finalDiscount > 0 && (
          <div className="d-flex justify-content-between border-bottom pb-2 mb-2 text-success">
            <span>Hotel Discount (-)</span>
            <span>- ₹ {finalDiscount.toFixed(2)}</span>
          </div>
        )}
        {/* Show amount after hotel discount (before coupon) */}
        {finalDiscount > 0 && finalCouponDiscount > 0 && (
          <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
            <span>Amount after Hotel Discount</span>
            <span>₹ {subtotalAfterHotelDiscount.toFixed(2)}</span>
          </div>
        )}
        {/* ✅ CORRECTED: Coupon Discount - Applied LAST */}
        {finalCouponDiscount > 0 && (
          <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
            <div>
              <span className="text-success fw-bold">
                <i className="bi bi-tag-fill me-2"></i>
                Coupon Discount (-)
              </span>
              {appliedCoupon && (
                <div>
                  <small className="text-muted d-block">
                    Code:{" "}
                    <span className="fw-bold">
                      {appliedCoupon.code || appliedCoupon.couponCode}
                    </span>
                  </small>
                  {(appliedCoupon.discountType === "percentage" ||
                    appliedCoupon.type === "PERCENTAGE") && (
                    <small className="text-muted d-block">
                      {appliedCoupon.discount || appliedCoupon.value}% off
                    </small>
                  )}
                </div>
              )}
            </div>
            <span className="text-success fw-bold">
              - ₹ {finalCouponDiscount.toFixed(2)}
            </span>
          </div>
        )}
        {/* ✅ CORRECTED: Final Total Payable Amount */}
        <div className="d-flex justify-content-between pt-3 mt-3 border-top">
          <span className="fs-5 fw-semibold">Total Payable</span>
          <div className="text-end">
            <span className="fs-5 fw-semibold">
              {/* ₹ {roundedTotal.toLocaleString()}₹{" "} */}
              {Number(actualBaseFare + vendorCommissionAmount).toLocaleString(
                "en-IN",
                { minimumFractionDigits: 2, maximumFractionDigits: 2 }
              )}
            </span>
            {/* Show original price if any discount applied */}
            {(finalDiscount > 0 || finalCouponDiscount > 0) && (
              <div className="text-muted small text-decoration-line-through">
                Original: ₹ {subtotalBeforeDiscounts.toFixed(2)}
              </div>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default FareSummaryCard;
