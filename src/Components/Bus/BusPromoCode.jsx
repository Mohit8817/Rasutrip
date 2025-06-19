import React from "react";
import { Card, Form, Button } from "react-bootstrap";
import "../../Style/Pagescss/BusResultPage.css";

const BusPromoCode = () => {
  return (
    <Card className="promo-card shadow-sm mt-3">
      <Card.Header className="promo-header">Promo Code</Card.Header>
      <Card.Body className="p-3">
        <Form.Group className="mb-3">
          <Form.Label className="promo-label">Enter Your Promo Code</Form.Label>
          <div className="promo-input-group">
            <Form.Control type="text" placeholder="Apply Promo Code" />
            <Button variant="outline-danger" className="promo-apply-btn">
              Apply
            </Button>
          </div>
        </Form.Group>

        <div className="promo-option">
          <Form.Check
            type="radio"
            id="promo1"
            label={
              <>
                <strong>CODE0EC5B3</strong>
                <div className="promo-subtext">Bus Coupon Discount</div>
              </>
            }
            name="promoCode"
          />
        </div>
      </Card.Body>
    </Card>
  );
};

export default BusPromoCode;
