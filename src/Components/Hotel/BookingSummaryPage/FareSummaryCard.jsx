import React from "react";
import { Card } from "react-bootstrap";

const FareSummaryCard = () => {
  return (
    <Card className="mb-3 shadow-sm">
      <Card.Header className="bg-light fw-bold">Fare Summary</Card.Header>
      <Card.Body className="p-3">
        <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
          <span>Base Fare</span>
          <span>₹ 3831.86</span>
        </div>
        <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
          <span>Tax</span>
          <span>₹ 11.8</span>
        </div>
        <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
          <span>Service Charges</span>
          <span>₹ 0</span>
        </div>
        <div className="d-flex justify-content-between border-bottom pb-2 mb-3">
          <span>GST (+)</span>
          <span>₹ 0</span>
        </div>
        <div className="d-flex justify-content-between fw-bold pt-2 border-top">
          <span>Pay Amount</span>
          <span>₹ 3843.66</span>
        </div>
      </Card.Body>
    </Card>
  );
};

export default FareSummaryCard;
