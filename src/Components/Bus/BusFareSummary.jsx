// src/Components/BusFareSummary.jsx
import React from "react";
import { Card } from "react-bootstrap";
import "../../Style/Pagescss/BusResultPage.css";

const BusFareSummary = ({
  basePrice = 0,
  vendorCommissionPercentage = 0,
  taxes = 0,
  otherCharges = 0,
  gst = 0,
  discount = 0,
  showVendorCommission = true
}) => {

  // Calculate vendor commission
  const vendorCommissionAmount = (basePrice * vendorCommissionPercentage) / 100;

  // Calculate total after adding vendor commission
  const priceWithCommission = basePrice + vendorCommissionAmount;

  // Calculate final total
  const totalAmount = priceWithCommission + taxes + otherCharges + gst - discount;

  return (
    <div>
      <Card className="fare-card shadow-sm mt-3">
        <Card.Header className="fare-header">Fare Summary</Card.Header>
        <Card.Body className="p-3">
          <div className="fare-row">
            <span>Base Fare</span>
            <span>₹ {basePrice.toFixed(2)}</span>
          </div>

          {showVendorCommission && vendorCommissionAmount > 0 && (
            <div className="fare-row text-primary">
              <span>Service Charges ({vendorCommissionPercentage}%)</span>
              <span>₹ {vendorCommissionAmount.toFixed(2)}</span>
            </div>
          )}

          {taxes > 0 && (
            <div className="fare-row">
              <span>Taxes</span>
              <span>₹ {taxes.toFixed(2)}</span>
            </div>
          )}

          {otherCharges > 0 && (
            <div className="fare-row">
              <span>Other Charges</span>
              <span>₹ {otherCharges.toFixed(2)}</span>
            </div>
          )}

          {gst > 0 && (
            <div className="fare-row">
              <span>GST</span>
              <span>₹ {gst.toFixed(2)}</span>
            </div>
          )}

          {discount > 0 && (
            <div className="fare-row text-success">
              <span>Discount (-)</span>
              <span>- ₹ {discount.toFixed(2)}</span>
            </div>
          )}

          <div className="fare-total">
            <span>Pay Amount</span>
            <span>₹ {totalAmount.toFixed(2)}</span>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default BusFareSummary;