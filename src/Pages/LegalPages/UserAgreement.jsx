import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const UserAgreement = () => {
    return (
        <div className="terms-wrapper py-5">
            <Container className="rounded shadow p-4 bg-white">
                <Row>
                    <Col>
                        <h2 className="text-center fw-bold mb-4">User Agreement – Rasutrip.com</h2>

                        <p>
                            At Rasutrip.com, we are committed to providing you with a secure and transparent payment experience. Please read the following User Agreement carefully:
                        </p>

                        <h5 className="fw-bold mt-4">Secure Payments</h5>
                        <p>
                            All transactions carried out on Rasutrip.com are 100% secure. Our website uses 128-bit Secure Socket Layer (SSL) encryption provided by Network Solutions, ensuring that all your personal and financial information is fully protected.
                        </p>
                        <p>
                            We support payments via major cards including Visa and MasterCard, which are processed securely through our trusted online payment gateway system.
                        </p>

                        <h5 className="fw-bold mt-4">Card Information & Data Security</h5>
                        <ul>
                            <li>Your card details are safe: We do not store or capture any of your credit/debit card details on our platform.</li>
                            <li>All online transactions are redirected to the acquiring bank’s secure payment gateway for completion.</li>
                            <li>No card information is retained on any retrieval system or storage device by Rasutrip.com.</li>
                        </ul>

                        <h5 className="fw-bold mt-4">Customer Responsibility</h5>
                        <ul>
                            <li>Rasutrip.com shall not be held liable for:
                                <ul>
                                    <li>Any negligence on the part of the user or a third party in protecting sensitive data from being viewed by others during the online transaction process.</li>
                                    <li>Any incorrect or inaccurate information submitted during the payment process.</li>
                                </ul>
                            </li>
                            <li>Users are advised to:
                                <ul>
                                    <li>Ensure that their screen is not visible to others during transactions.</li>
                                    <li>Verify the accuracy of all information entered before completing the payment.</li>
                                </ul>
                            </li>
                        </ul>

                        <p className="mt-3">
                            This agreement is subject to change without notice. It is the user's responsibility to review it periodically to stay updated with our terms and security practices.
                        </p>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default UserAgreement;
