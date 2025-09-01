import React from "react";
import { Card } from "react-bootstrap";

const FareSummaryCard = ({ 
  priceDetails, 
  blockedRoomData, 
  appliedCoupon = null, 
  couponDiscount = 0 
}) => {
  // Get data from blocked room response if available
  const roomData = blockedRoomData?.HotelRoomsDetails?.[0] || {};
  const priceData = roomData?.Price || {};
  
  // Use blocked room data first, then fallback to priceDetails
  const {
    baseFare = priceData.RoomPrice || priceDetails?.baseFare || 0,
    publishedPrice = priceData.PublishedPrice || priceDetails?.publishedPrice || 0,
    tax = priceData.Tax || priceDetails?.tax || 0,
    discount = priceData.Discount || priceDetails?.discount || 0,
    serviceCharges = priceData.ServiceCharges || priceDetails?.serviceCharges || 0,
    otherCharges = priceData.OtherCharges || priceDetails?.otherCharges || 0,
    vendorCommissionPercentage = priceDetails?.vendorCommissionPercentage || 12,
  } = priceDetails || {};

  // GST data from blocked room response
  const gstData = priceData.GST || {};
  const cgstAmount = gstData.CGSTAmount || 0;
  const sgstAmount = gstData.SGSTAmount || 0;
  const igstAmount = gstData.IGSTAmount || 0;
  const cgstRate = gstData.CGSTRate || 0;
  const sgstRate = gstData.SGSTRate || 0;
  const igstRate = gstData.IGSTRate || 0;

  // Use PublishedPrice as main price (this includes room price + tax)
  const actualBaseFare = publishedPrice || baseFare;
  
  // Calculate vendor commission on published price
  const vendorCommissionAmount = (actualBaseFare * vendorCommissionPercentage) / 100;
  
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
  const subtotal = actualBaseFare + vendorCommissionAmount + totalGST + serviceCharges + otherCharges - discount;
  const customerTotal = Math.max(0, subtotal - finalCouponDiscount);
  const roundedTotal = parseFloat(customerTotal.toFixed(2));

  return (
    <Card className="mb-3 shadow-sm">
      <Card.Header className="bg-light fw-bold">Fare Summary</Card.Header>
      <Card.Body className="p-3">
        
        {/* Base Fare */}
        <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
          <span>Base Fare</span>
          <span>₹ {actualBaseFare.toLocaleString()}</span>
        </div>
        
        {/* Taxes */}
        {(tax > 0 || totalGST > 0) && (
          <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
            <span>Taxes</span>
            <span>₹ {(tax + totalGST).toFixed(2)}</span>
          </div>
        )}
        
        {/* Other Charges (if any) */}
        {(serviceCharges + otherCharges) > 0 && (
          <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
            <span>Other Charges</span>
            <span>₹ {(serviceCharges + otherCharges).toFixed(2)}</span>
          </div>
        )}

        {/* GST */}
        {totalGST > 0 && (
          <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
            <span>GST (+)</span>
            <span>₹ {totalGST.toFixed(2)}</span>
          </div>
        )}
        
        {/* Convenience Fee */}
        <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
          <span>Convenience Fee</span>
          <span>₹ {vendorCommissionAmount.toFixed(2)}</span>
        </div>

        {/* Discount (if any) */}
        {discount > 0 && (
          <div className="d-flex justify-content-between border-bottom pb-2 mb-2 text-success">
            <span>Discount (-)</span>
            <span>- ₹ {discount.toFixed(2)}</span>
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

      </Card.Body>
    </Card>
  );
};

export default FareSummaryCard;