import React from "react";
import { Card, Form, Button, InputGroup } from "react-bootstrap";

const HotelPromoCodeCard = () => {
    return (
        <div>

            <Card className="shadow-sm">
                <Card.Header className="bg-light fw-bold">Promo Code</Card.Header>
                <Card.Body>
                    <Form>
                        <Form.Label className="fw-normal">Enter Your Promo Code</Form.Label>
                        <InputGroup>
                            <Form.Control
                                type="text"
                                placeholder="Apply Promo Code"
                                className="rounded-0"
                            />
                            <Button variant="outline-secondary" className="rounded-0">
                                Apply
                            </Button>
                        </InputGroup>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    )
}

export default HotelPromoCodeCard 