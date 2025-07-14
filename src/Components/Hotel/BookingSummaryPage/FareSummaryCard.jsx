import React from "react";
import { Card } from "react-bootstrap";

const FareSummaryCard = ({ priceDetails }) => {
  const {
    baseFare = 0,
    tax = 0,
    serviceCharges = 0,
    gst = 0,
  } = priceDetails || {};

  const total = baseFare + tax + serviceCharges + gst;

  return (
    <Card className="mb-3 shadow-sm">
      <Card.Header className="bg-light fw-bold">Fare Summary</Card.Header>
      <Card.Body className="p-3">
        <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
          <span>Base Fare</span>
          <span>₹ {baseFare.toFixed(2)}</span>
        </div>
        <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
          <span>Tax</span>
          <span>₹ {tax.toFixed(2)}</span>
        </div>
        <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
          <span>Service Charges</span>
          <span>₹ {serviceCharges.toFixed(2)}</span>
        </div>
        <div className="d-flex justify-content-between border-bottom pb-2 mb-3">
          <span>GST (+)</span>
          <span>₹ {gst.toFixed(2)}</span>
        </div>
        <div className="d-flex justify-content-between fw-bold pt-2 border-top">
          <span>Pay Amount</span>
          <span>₹ {total.toFixed(2)}</span>
        </div>
      </Card.Body>
    </Card>
  );
};

export default FareSummaryCard;
