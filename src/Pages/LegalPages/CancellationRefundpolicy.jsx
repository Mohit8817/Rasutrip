import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const CancellationRefundPolicy = () => {
    return (
        <div className="terms-wrapper py-5">
            <Container className="rounded shadow p-4 bg-white">
                <Row>
                    <Col>
                        <h2 className="text-center fw-bold mb-4">
                            Cancellation & Refund Policy
                        </h2>
                        <p className="text-center text-muted">
                            (Applicable to Flight, Bus, and Hotel bookings only)
                        </p>

                        <h5 className="fw-bold mt-4">Flight Cancellation Policy</h5>
                        <p>
                            For flight cancellations, please email:{" "}
                            <strong>flights@rasutrip.com</strong>
                        </p>
                        <ul>
                            <li>
                                All flight bookings are subject to airline cancellation rules,
                                which vary by flight and fare type.
                            </li>
                            <li>
                                <strong>RASUTRIP Cancellation Charges:</strong>
                                <ul>
                                    <li>₹300 per passenger per sector (Domestic)</li>
                                    <li>₹500 per passenger per sector (International)</li>
                                </ul>
                            </li>
                            <li>
                                <strong>Non-refundable items:</strong>
                                <ul>
                                    <li>RASUTRIP insurance fees</li>
                                    <li>Zero Cancellation-Fee premium</li>
                                    <li>Convenience fees & payment gateway charges</li>
                                </ul>
                            </li>
                            <li>
                                Some fares may be completely non-refundable as per airline
                                policies.
                            </li>
                            <li>
                                Partial cancellations may not be allowed on certain bookings.
                            </li>
                            <li>
                                Cancellations can be requested via your RASUTRIP account or by
                                email.
                            </li>
                            <li>
                                Booking changes may require direct airline contact in some
                                cases.
                            </li>
                            <li>
                                If cancelling within 24 hours of departure, contact the airline
                                directly first, then submit your refund request to RASUTRIP.
                            </li>
                            <li>
                                No-show cases must be claimed within 90 days of travel; late
                                requests won’t be entertained.
                            </li>
                            <li>
                                Refunds are processed only after receiving the refund from the
                                airline, and are subject to deductions as per airline and
                                RASUTRIP policies.
                            </li>
                            <li>
                                In international round trips, no-show on the outbound leg may
                                cancel the return automatically (for same PNR bookings).
                            </li>
                            <li>
                                Flight tickets are valid for 1 year from the issue date (or as
                                per airline policy).
                            </li>
                        </ul>

                        <h5 className="fw-bold mt-4">Bus Cancellation Policy</h5>
                        <ul>
                            <li>
                                Bus cancellations follow the policy of the respective bus
                                operator.
                            </li>
                            <li>
                                Cancellation charges vary based on the operator, route, and time
                                before departure.
                            </li>
                            <li>
                                Some bookings may be non-refundable or may not allow partial
                                cancellation.
                            </li>
                            <li>
                                RASUTRIP service fee may apply on top of operator charges.
                            </li>
                            <li>
                                Refunds will be initiated once confirmed by the operator and
                                credited back to the original payment method.
                            </li>
                            <li>
                                No refunds will be processed for no-shows or missed buses due to
                                late arrival at boarding point.
                            </li>
                            <li>
                                Refund claims must be submitted within 90 days of the scheduled
                                travel date.
                            </li>
                        </ul>

                        <h5 className="fw-bold mt-4">Hotel Cancellation Policy</h5>
                        <ul>
                            <li>
                                Hotel cancellations are subject to the specific hotel’s
                                cancellation terms.
                            </li>
                            <li>
                                Some bookings are fully non-refundable or may carry heavy
                                penalties depending on the date/time of cancellation.
                            </li>
                            <li>
                                RASUTRIP will process refunds only after confirmation from the
                                hotel supplier.
                            </li>
                            <li>
                                No-shows or early checkouts are generally non-refundable.
                            </li>
                            <li>
                                Refund claims must be made within 90 days of the original
                                check-in date.
                            </li>
                            <li>Refunds will be credited to the original payment source.</li>
                        </ul>

                        <h5 className="fw-bold mt-4">General Refund Timelines</h5>
                        <ul>
                            <li>
                                Refunds are initiated within 72 hours after RASUTRIP receives
                                confirmation and funds from the airline, bus operator, or hotel
                                partner.
                            </li>
                            <li>Credit card: Up to 72 hours</li>
                            <li>Net banking: Up to 7 working days</li>
                            <li>
                                Wallet amount: Non-transferable to bank but can be reused for
                                future RASUTRIP bookings.
                            </li>
                        </ul>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default CancellationRefundPolicy;
