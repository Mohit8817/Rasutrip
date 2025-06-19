import React from "react";
import { Card } from "react-bootstrap";
import "../../Style/Pagescss/BusResultPage.css";

const BusFareSummary = () => {
  return (
    <div>
      <Card className="fare-card shadow-sm mt-3">
        <Card.Header className="fare-header">Fare Summary</Card.Header>
        <Card.Body className="p-3">
          <div className="fare-row">
            <span>Base Fare</span>
            <span>₹ 733.95</span>
          </div>
          <div className="fare-row">
            <span>Taxes</span>
            <span>₹ 0</span>
          </div>
          <div className="fare-row">
            <span>Other & Service Charges</span>
            <span>₹ 0</span>
          </div>
          <div className="fare-row">
            <span>GST (+)</span>
            <span>₹ 0</span>
          </div>
          <div className="fare-total">
            <span>Pay Amount</span>
            <span>₹ 733.95</span>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default BusFareSummary;
