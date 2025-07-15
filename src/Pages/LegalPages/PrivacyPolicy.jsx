import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const PrivacyPolicy = () => {
    return (
        <div className="terms-wrapper py-5">
            <Container className="rounded shadow p-4 bg-white">
                <Row>
                    <Col>
                        <h2 className="text-center fw-bold mb-4">Privacy Policy – RASUTRIP.com</h2>
                        <p>
                            This Privacy Policy outlines how RASUTRIP.com collects, uses, and protects the information you provide when using our website. We are committed to ensuring your privacy is protected at all times. Should we ask you to provide any information by which you can be identified while using this site, you can be assured that it will only be used in accordance with this Privacy Statement.
                        </p>

                        <h5 className="fw-bold mt-4">Policy Updates</h5>
                        <p>
                            RASUTRIP.com may update this policy periodically by revising this page. You are encouraged to check this page regularly to ensure that you are satisfied with any changes.
                        </p>

                        <h5 className="fw-bold mt-4">Links to Other Websites</h5>
                        <p>
                            Our platform may contain links to external websites for your convenience. However, once you leave RASUTRIP.com, we do not have control over the other websites and cannot be responsible for the protection and privacy of any information you provide on them. These external sites are not governed by this Privacy Policy. Please review their policies separately.
                        </p>

                        <h5 className="fw-bold mt-4">Controlling Your Personal Information</h5>
                        <ul>
                            <li>Look for the checkbox in our forms to opt-out of your data being used for direct marketing.</li>
                            <li>If you have previously agreed to receive marketing content from us, you may unsubscribe anytime by contacting us via email.</li>
                            <li>
                                RASUTRIP.com will not sell, distribute, or lease your personal information to third parties unless required by law or with your explicit permission.
                            </li>
                            <li>
                                We may use your personal information to send you offers or updates related to third-party services only if you opt-in.
                            </li>
                            <li>
                                If you believe any information we hold about you is incorrect or incomplete, please contact us immediately. We will promptly correct any such data.
                            </li>
                        </ul>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default PrivacyPolicy;
