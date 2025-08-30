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
    agentCommission = priceData.AgentCommission || priceDetails?.agentCommission || 0,
    tds = priceData.TDS || priceDetails?.tds || 0,
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
  const taxableAmount = gstData.TaxableAmount || 0;

  // Use PublishedPrice as main price (this includes room price + tax)
  const actualBaseFare = publishedPrice;
  
  // Calculate vendor commission on published price
  const vendorCommissionAmount = (actualBaseFare * vendorCommissionPercentage) / 100;
  
  // Customer pays: Published price + Vendor commission + GST (if applicable)
  let totalGST = 0;
  if (cgstAmount > 0 || sgstAmount > 0 || igstAmount > 0) {
    totalGST = cgstAmount + sgstAmount + igstAmount;
  } else if (cgstRate > 0 || sgstRate > 0 || igstRate > 0) {
    // Calculate GST on (published price + commission) if not provided
    const gstBase = actualBaseFare + vendorCommissionAmount;
    totalGST = (gstBase * (cgstRate + sgstRate + igstRate)) / 100;
  }

  // ✅ Get coupon discount from props or priceDetails
  const finalCouponDiscount = couponDiscount || priceDetails?.couponDiscount || priceDetails?.appliedCouponDiscount || 0;
  const finalAppliedCoupon = appliedCoupon || priceDetails?.couponData;

  // Calculate subtotal before coupon
  const subtotal = actualBaseFare + vendorCommissionAmount + totalGST - discount;
  
  // Final amount customer pays with coupon discount
  const customerTotal = Math.max(0, subtotal - finalCouponDiscount);
  const roundedTotal = parseFloat(customerTotal.toFixed(2));
  
  // Vendor gets the published price
  const vendorPayment = actualBaseFare;
  
  // Our profit is the vendor commission
  const ourProfit = vendorCommissionAmount;

  return (
    <Card className="mb-3 shadow-sm">
      <Card.Header className="bg-light fw-bold">Fare Summary</Card.Header>
      <Card.Body className="p-3">
        {/* Room Price */}
        {baseFare > 0 && baseFare !== publishedPrice && (
          <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
            <span>
              Room Price
              <small className="text-muted d-block">Base room fare</small>
            </span>
            <span>₹ {baseFare.toLocaleString()}</span>
          </div>
        )}
        
        {/* Hotel Taxes (if separate from published price) */}
        {tax > 0 && (
          <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
            <span>
              Hotel Taxes
              <small className="text-muted d-block">Included in published price</small>
            </span>
            <span>₹ {tax.toFixed(2)}</span>
          </div>
        )}

        {/* Published Price (Main Price) */}
        <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
          <span>
            Hotel Total
            <small className="text-muted d-block">Published price (Room + Hotel taxes)</small>
          </span>
          <span className="fw-bold">₹ {actualBaseFare.toLocaleString()}</span>
        </div>
        
        {/* Service Charges (if any) */}
        {serviceCharges > 0 && (
          <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
            <span>
              Service Charges
              <small className="text-muted d-block">Hotel service charges</small>
            </span>
            <span>₹ {serviceCharges.toFixed(2)}</span>
          </div>
        )}

        {/* Other Charges (if any) */}
        {otherCharges > 0 && (
          <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
            <span>
              Other Charges
              <small className="text-muted d-block">Additional charges</small>
            </span>
            <span>₹ {otherCharges.toFixed(2)}</span>
          </div>
        )}
        
        {/* Our Commission */}
        <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
          <span>
            Booking Fee
            <small className="text-muted d-block">Service charge ({vendorCommissionPercentage}%)</small>
          </span>
          <span className="text-success fw-bold">₹ {vendorCommissionAmount.toFixed(2)}</span>
        </div>

        {/* TDS (if any) */}
        {tds > 0 && (
          <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
            <span>
              TDS
              <small className="text-muted d-block">Tax deducted at source</small>
            </span>
            <span>₹ {tds.toFixed(2)}</span>
          </div>
        )}
        
        {/* GST Breakdown */}
        {totalGST > 0 && (
          <>
            {cgstAmount > 0 && (
              <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                <span>
                  CGST ({cgstRate}%)
                  <small className="text-muted d-block">Central GST</small>
                </span>
                <span>₹ {cgstAmount.toFixed(2)}</span>
              </div>
            )}
            
            {sgstAmount > 0 && (
              <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                <span>
                  SGST ({sgstRate}%)
                  <small className="text-muted d-block">State GST</small>
                </span>
                <span>₹ {sgstAmount.toFixed(2)}</span>
              </div>
            )}
            
            {igstAmount > 0 && (
              <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                <span>
                  IGST ({igstRate}%)
                  <small className="text-muted d-block">Integrated GST</small>
                </span>
                <span>₹ {igstAmount.toFixed(2)}</span>
              </div>
            )}
            
            {/* Show calculated GST if not provided in response */}
            {(cgstAmount === 0 && sgstAmount === 0 && igstAmount === 0) && totalGST > 0 && (
              <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                <span>
                  GST ({cgstRate + sgstRate + igstRate}%)
                  <small className="text-muted d-block">On booking amount</small>
                </span>
                <span>₹ {totalGST.toFixed(2)}</span>
              </div>
            )}
          </>
        )}
        
        {/* Regular Discount (if any) */}
        {discount > 0 && (
          <div className="d-flex justify-content-between border-bottom pb-2 mb-2 text-success">
            <span>Discount Applied</span>
            <span>- ₹ {discount.toFixed(2)}</span>
          </div>
        )}

        {/* ✅ Subtotal before coupon (only show if coupon is applied) */}
        {finalCouponDiscount > 0 && (
          <div className="d-flex justify-content-between border-bottom pb-2 mb-2 fw-bold">
            <span>Subtotal</span>
            <span>₹ {subtotal.toFixed(2)}</span>
          </div>
        )}

        {/* ✅ COUPON DISCOUNT - Enhanced styling */}
        {finalCouponDiscount > 0 && (
          <div className="d-flex justify-content-between border-bottom pb-2 mb-2 bg-success-subtle p-2 rounded text-success">
            <span>
              <div className="d-flex align-items-center">
                <i className="bi bi-tag-fill me-2"></i>
                <strong>Coupon Discount</strong>
              </div>
              {finalAppliedCoupon && (
                <small className="d-block mt-1">
                  Code: <strong>{finalAppliedCoupon.code || finalAppliedCoupon.couponCode}</strong>
                  {(finalAppliedCoupon.discountType === 'percentage' || finalAppliedCoupon.type === 'PERCENTAGE') 
                    ? ` (${finalAppliedCoupon.discount || finalAppliedCoupon.value}% off)`
                    : ' (Flat Discount)'}
                </small>
              )}
            </span>
            <span className="fw-bold fs-6">- ₹ {finalCouponDiscount.toFixed(2)}</span>
          </div>
        )}
        
        {/* Agent Commission (if shown in API) */}
        {agentCommission > 0 && (
          <div className="d-flex justify-content-between border-bottom pb-2 mb-2 text-info">
            <span>
              Agent Commission
              <small className="text-muted d-block">Commission earned</small>
            </span>
            <span>₹ {agentCommission.toFixed(2)}</span>
          </div>
        )}
        
        {/* ✅ Total Amount Customer Pays (WITH COUPON DISCOUNT) */}
        <div className="d-flex justify-content-between fw-bold pt-2 border-top fs-5">
          <span>Total Amount</span>
          <span className="text-danger">₹ {roundedTotal.toLocaleString()}</span>
        </div>

        {/* ✅ Show savings summary if coupon applied */}
        {finalCouponDiscount > 0 && (
          <div className="mt-3 p-2 bg-success-subtle border border-success rounded">
            <div className="text-center">
              <div className="text-success fw-bold">
                <i className="bi bi-check-circle-fill me-2"></i>
                You saved ₹{finalCouponDiscount.toFixed(2)} with this coupon!
              </div>
              {finalAppliedCoupon && (
                <small className="text-muted d-block mt-1">
                  Coupon "{finalAppliedCoupon.code || finalAppliedCoupon.couponCode}" applied successfully
                </small>
              )}
            </div>
          </div>
        )}
        
        {/* Revenue breakdown - for admin/internal view */}
        {ourProfit > 0 && (
          <div className="mt-3 p-2 bg-light border rounded">
            <div className="small mb-2">
              <strong>Business Summary:</strong>
            </div>
            
            <div className="d-flex justify-content-between small text-muted mb-1">
              <span>Customer Pays:</span>
              <span className="text-success fw-bold">₹{roundedTotal.toLocaleString()}</span>
            </div>
            
            <div className="d-flex justify-content-between small text-muted mb-1">
              <span>Hotel Gets:</span>
              <span className="text-danger">₹{vendorPayment.toLocaleString()}</span>
            </div>
            
            {finalCouponDiscount > 0 && (
              <div className="d-flex justify-content-between small text-muted mb-1">
                <span>Coupon Discount:</span>
                <span className="text-warning">₹{finalCouponDiscount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="d-flex justify-content-between small mb-1">
              <span>
                <strong>Our Revenue:</strong>
                <br />
                <small className="text-muted">
                  Booking Fee ({vendorCommissionPercentage}%)
                </small>
              </span>
              <span className="text-success fw-bold">₹{ourProfit.toFixed(2)}</span>
            </div>
            
            <div className="small text-muted mt-2 pt-2 border-top">
              <strong>Commission Details:</strong><br />
              Booking Fee: ₹{vendorCommissionAmount.toFixed(2)} ({vendorCommissionPercentage}% of ₹{actualBaseFare.toLocaleString()})
              {finalCouponDiscount > 0 && (
                <div className="mt-1">
                  Original Total: ₹{subtotal.toFixed(2)} | After Coupon: ₹{roundedTotal.toLocaleString()}
                </div>
              )}
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default FareSummaryCard;