import React from "react";
import { Card } from "react-bootstrap";
import { useLocation } from 'react-router-dom';
import "../../Style/Pagescss/BusResultPage.css";

const BusFareSummary = ({
  // Props that can be passed directly (fallback only)
  basePrice,
  vendorCommissionPercentage = 0,
  taxes,
  otherCharges,
  gst,
  discount = 0,
  showVendorCommission = true,
  totalPrice,
  couponDiscount = 0,
  appliedCouponData = null
}) => {
  const location = useLocation();

  // Get data from location state (passed from BusDetailinfo)
  const state = location.state;
  console.log("BusFareSummary - Full state:", state);
  console.log("BusFareSummary - Coupon data:", { couponDiscount, appliedCouponData });

  // Extract data from the state object that comes from BusDetailinfo
  const selectedSeats = state?.selectedSeats || [];
  const busData = state?.bus || state?.selectedBus;
  const stateTotalPrice = state?.totalPrice;
  const fareBreakdown = state?.fareBreakdown;

  console.log("BusFareSummary - Extracted data:", {
    selectedSeats,
    busData,
    stateTotalPrice,
    fareBreakdown,
    seatsCount: selectedSeats?.length
  });

  // Initialize fare calculation object with all API fields
  const fareData = {
    basePrice: 0,
    publishedPrice: 0,
    offeredPrice: 0,
    tax: 0,
    otherCharges: 0,
    serviceCharges: 0,
    agentCommission: 0,
    tds: 0,
    discount: 0,
    gst: {
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      total: 0
    },
    commissionPercentage: 0,
    numberOfSeats: selectedSeats?.length || 0
  };

  // Method 1: Calculate from selected seats (most accurate for seat-based booking)
  if (selectedSeats && selectedSeats.length > 0) {
    console.log("Using selected seats data:", selectedSeats);

    // Calculate total from all selected seats
    let totals = {
      basePrice: 0,
      publishedPrice: 0,
      offeredPrice: 0,
      tax: 0,
      otherCharges: 0,
      serviceCharges: 0,
      agentCommission: 0,
      tds: 0,
      discount: 0,
      cgst: 0,
      sgst: 0,
      igst: 0
    };

    selectedSeats.forEach(seat => {
      // Get seat price - check multiple possible structures
      const seatPriceObj = seat?.Price || seat;

      // Extract all API price fields dynamically
      totals.basePrice += Number(seatPriceObj?.BasePrice || 0);
      totals.publishedPrice += Number(seatPriceObj?.PublishedPrice || 0);
      totals.offeredPrice += Number(seatPriceObj?.OfferedPrice || 0);
      totals.tax += Number(seatPriceObj?.Tax || 0);
      totals.otherCharges += Number(seatPriceObj?.OtherCharges || 0);
      totals.serviceCharges += Number(seatPriceObj?.ServiceCharges || 0);
      totals.agentCommission += Number(seatPriceObj?.AgentCommission || 0);
      totals.tds += Number(seatPriceObj?.TDS || 0);
      totals.discount += Number(seatPriceObj?.Discount || 0);

      // Handle GST object structure
      if (seatPriceObj?.GST && typeof seatPriceObj.GST === 'object') {
        totals.cgst += Number(seatPriceObj.GST.CGSTAmount || 0);
        totals.sgst += Number(seatPriceObj.GST.SGSTAmount || 0);
        totals.igst += Number(seatPriceObj.GST.IGSTAmount || 0);
      } else {
        // If GST is a simple number, add to IGST
        totals.igst += Number(seatPriceObj?.GST || 0);
      }
    });

    // Set all fare data from calculated totals
    fareData.basePrice = totals.basePrice;
    fareData.publishedPrice = totals.publishedPrice;
    fareData.offeredPrice = totals.offeredPrice;
    fareData.tax = totals.tax;
    fareData.otherCharges = totals.otherCharges;
    fareData.serviceCharges = totals.serviceCharges;
    fareData.agentCommission = totals.agentCommission;
    fareData.tds = totals.tds;
    fareData.discount = totals.discount;
    fareData.gst = {
      cgstAmount: totals.cgst,
      sgstAmount: totals.sgst,
      igstAmount: totals.igst,
      total: totals.cgst + totals.sgst + totals.igst
    };

    // Get dynamic commission percentage from bus data
    fareData.commissionPercentage = Number(
      busData?.vendorCommissionPercentage ||
      busData?.originalBusPrice?.rasutripCommissionPercentage ||
      state?.vendorCommissionPercentage ||
      0
    );

    console.log("Calculated from seats:", fareData);
  }

  // Method 2: Use bus data if available (single bus pricing)
  else if (busData?.originalBusPrice || busData?.BusPrice || busData?.Price) {
    console.log("Using bus data:", busData);
    const busPriceObj = busData.originalBusPrice || busData.BusPrice || busData.Price;

    // Extract all API pricing fields exactly as they come
    fareData.basePrice = Number(busPriceObj.BasePrice || 0);
    fareData.publishedPrice = Number(busPriceObj.PublishedPrice || 0);
    fareData.offeredPrice = Number(busPriceObj.OfferedPrice || 0);
    fareData.tax = Number(busPriceObj.Tax || 0);
    fareData.otherCharges = Number(busPriceObj.OtherCharges || 0);
    fareData.serviceCharges = Number(busPriceObj.ServiceCharges || 0);
    fareData.agentCommission = Number(busPriceObj.AgentCommission || 0);
    fareData.tds = Number(busPriceObj.TDS || 0);
    fareData.discount = Number(busPriceObj.Discount || 0);

    // Handle GST object structure
    if (busPriceObj.GST && typeof busPriceObj.GST === 'object') {
      fareData.gst = {
        cgstAmount: Number(busPriceObj.GST.CGSTAmount || 0),
        sgstAmount: Number(busPriceObj.GST.SGSTAmount || 0),
        igstAmount: Number(busPriceObj.GST.IGSTAmount || 0),
        total: Number(busPriceObj.GST.CGSTAmount || 0) +
          Number(busPriceObj.GST.SGSTAmount || 0) +
          Number(busPriceObj.GST.IGSTAmount || 0)
      };
    } else {
      fareData.gst = {
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: Number(busPriceObj.GST || 0),
        total: Number(busPriceObj.GST || 0)
      };
    }

    // Get dynamic commission percentage from API
    fareData.commissionPercentage = Number(
      busPriceObj.rasutripCommissionPercentage ||
      busData?.vendorCommissionPercentage ||
      state?.vendorCommissionPercentage ||
      0
    );
  }

  // Method 3: Use state total price if available
  else if (stateTotalPrice && stateTotalPrice > 0) {
    console.log("Using state total price:", stateTotalPrice);
    fareData.publishedPrice = Number(stateTotalPrice);
    fareData.basePrice = Number(stateTotalPrice);
    fareData.offeredPrice = Number(stateTotalPrice);

    // Get dynamic commission percentage
    fareData.commissionPercentage = Number(
      busData?.vendorCommissionPercentage ||
      busData?.originalBusPrice?.rasutripCommissionPercentage ||
      state?.vendorCommissionPercentage ||
      0
    );
  }

  // Method 4: Use props as final fallback
  else {
    console.log("Using props fallback");
    fareData.publishedPrice = Number(totalPrice || basePrice || 0);
    fareData.basePrice = Number(basePrice || fareData.publishedPrice);
    fareData.tax = Number(taxes || 0);
    fareData.otherCharges = Number(otherCharges || 0);
    fareData.gst.total = Number(gst || 0);
    fareData.discount = Number(discount || 0);

    // Use prop or default to 0 if no API data available
    fareData.commissionPercentage = Number(
      state?.vendorCommissionPercentage ||
      vendorCommissionPercentage ||
      0
    );
  }

  // Calculate convenience fee (vendor commission) - only if enabled
  const convenienceFee = showVendorCommission && fareData.commissionPercentage > 0 ?
    (fareData.publishedPrice * fareData.commissionPercentage) / 100 : 0;

  // Calculate subtotal (before convenience fee and coupon discount) - include all charges, subtract discounts and TDS
  const subtotal = fareData.publishedPrice +
    fareData.serviceCharges +
    fareData.tax +
    fareData.otherCharges +
    fareData.gst.total +
    fareData.agentCommission -
    fareData.discount -
    fareData.tds;

  // Add convenience fee to get total before coupon
  const totalBeforeCoupon = subtotal + convenienceFee;

  // Apply coupon discount to get final total
  const finalTotal = Math.max(0, totalBeforeCoupon - (couponDiscount || 0));

  console.log("BusFareSummary - Final calculation:", {
    fareData,
    convenienceFee,
    subtotal,
    couponDiscount,
    totalBeforeCoupon,
    finalTotal
  });

  // Don't show component if no price data
  if (fareData.publishedPrice === 0 && fareData.basePrice === 0 && fareData.offeredPrice === 0) {
    return (
      <Card className="fare-card shadow-sm mt-3">
        <Card.Header className="fare-header">Fare Summary</Card.Header>
        <Card.Body className="p-3 text-center text-muted">
          <p>Price information not available</p>
          <small>Please select seats to view fare breakdown</small>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div>
      <Card className="fare-card shadow-sm mt-3">
        <Card.Header className="fare-header">
          Fare Summary
          {fareData.numberOfSeats > 0 && (
            <small className="ms-2 text-muted">
              ({fareData.numberOfSeats} seat{fareData.numberOfSeats !== 1 ? 's' : ''})
            </small>
          )}
        </Card.Header>
        <Card.Body className="p-3">

          {/* Base Price - Show only if different from Published Price and greater than 0 */}
          {fareData.basePrice > 0 && fareData.basePrice !== fareData.publishedPrice && (
            <div className="fare-row">
              <span>Base Price {fareData.numberOfSeats > 0 ? `(${fareData.numberOfSeats} seats)` : ''}</span>
              <span>₹ {fareData.basePrice.toFixed(2)}</span>
            </div>
          )}

          {/* Published Price - Main price from API */}
          {fareData.publishedPrice > 0 && (
            <div className="fare-row">
              <span>Base Fare{fareData.numberOfSeats > 0 ? ` (${fareData.numberOfSeats} seats)` : ''}</span>
              <span>₹ {fareData.publishedPrice.toFixed(2)}</span>
            </div>
          )}

          {/* Service Charges - Always show */}
          <div className="fare-row">
            <span>Service Charges</span>
            <span>₹ {fareData.serviceCharges.toFixed(2)}</span>
          </div>

          {/* Taxes - Always show */}
          <div className="fare-row">
            <span>Tax</span>
            <span>₹ {fareData.tax.toFixed(2)}</span>
          </div>

          {/* Other Charges - Always show */}
          <div className="fare-row">
            <span>Other Charges</span>
            <span>₹ {fareData.otherCharges.toFixed(2)}</span>
          </div>

          {/* GST - Always show total GST */}
          <div className="fare-row">
            <span>GST</span>
            <span>₹ {fareData.gst.total.toFixed(2)}</span>
          </div>

          {/* GST Breakdown - Show individual components only if they have values */}
          {fareData.gst.cgstAmount > 0 && (
            <div className="fare-row text-muted small ms-3">
              <span>• CGST</span>
              <span>₹ {fareData.gst.cgstAmount.toFixed(2)}</span>
            </div>
          )}

          {fareData.gst.sgstAmount > 0 && (
            <div className="fare-row text-muted small ms-3">
              <span>• SGST</span>
              <span>₹ {fareData.gst.sgstAmount.toFixed(2)}</span>
            </div>
          )}

          {fareData.gst.igstAmount > 0 && (
            <div className="fare-row text-muted small ms-3">
              <span>• IGST</span>
              <span>₹ {fareData.gst.igstAmount.toFixed(2)}</span>
            </div>
          )}

          {/* TDS Deduction - Always show */}
          <div className="fare-row">
            <span>TDS (-)</span>
            <span>- ₹ {fareData.tds.toFixed(2)}</span>
          </div>

          {/* API Discount - Always show */}
          <div className="fare-row">
            <span>Discount (-)</span>
            <span>- ₹ {fareData.discount.toFixed(2)}</span>
          </div>

          <hr className="my-2" />

          {/* Subtotal */}
          <div className="fare-row fw-bold">
            <span>Subtotal</span>
            <span>₹ {subtotal.toFixed(2)}</span>
          </div>

          {/* Convenience Fee - Show only if commission is configured and greater than 0 */}
          {showVendorCommission && convenienceFee > 0 && (
            <div className="fare-row">
              <span>Convenience Fee</span>
              <span>₹ {convenienceFee.toFixed(2)}</span>
            </div>
          )}

          <hr className="my-2" />

          {/* Total Before Coupon */}
          <div className="fare-row fw-bold">
            <span>Total Before Discount</span>
            <span>₹ {totalBeforeCoupon.toFixed(2)}</span>
          </div>

          {/* Coupon Discount - Show only if applied */}
          {couponDiscount > 0 && appliedCouponData && (
            <div className="fare-row text-success">
              <span>
                Coupon Discount (-)
                <small className="text-muted d-block">{appliedCouponData.code}</small>
              </span>
              <span>- ₹ {couponDiscount.toFixed(2)}</span>
            </div>
          )}

          <hr className="my-2" />

          {/* Final Total */}
          <div className="fare-total">
            <span>Total Amount</span>
            <span>₹ {finalTotal.toFixed(2)}</span>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default BusFareSummary;