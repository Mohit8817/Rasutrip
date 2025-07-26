import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import "../../Style/Pagescss/LegalPages.css"; // Create this CSS file for custom styles

const TermsandConditions = () => {
    return (
        <div className="terms-wrapper py-5">
            <Container className="rounded shadow p-4 bg-white">
                <Row>
                    <Col>
                        <h2 className="text-center fw-bold mb-4">Terms & Conditions</h2>
                        <p className="mb-4">
                            The use of RASUTRIP.com is subject to the following terms and conditions. By using our website, you agree to comply with and be bound by the following terms:
                        </p>

                        <h5 className="fw-bold">1. Website Content & Updates</h5>
                        <ul>
                            <li>The content on RASUTRIP.com is provided for your general information and convenience only. It is subject to change without prior notice.</li>
                            <li>We reserve the right to update or modify any content, features, or services on the website at any time.</li>
                        </ul>

                        <h5 className="fw-bold">2. Accuracy & Liability Disclaimer</h5>
                        <ul>
                            <li>Neither RASUTRIP nor any third-party providers make any warranties or guarantees about the accuracy, timeliness, performance, completeness, or suitability of the information and materials offered on this website.</li>
                            <li>You acknowledge that such information and materials may contain errors or inaccuracies, and we exclude liability for any such inaccuracies or errors to the fullest extent permitted by law.</li>
                        </ul>

                        <h5 className="fw-bold">3. Use at Your Own Risk</h5>
                        <ul>
                            <li>Your use of any information, services (bus, flight, hotel bookings), or materials on RASUTRIP.com is entirely at your own risk, and RASUTRIP shall not be held liable.</li>
                            <li>It is your responsibility to ensure that any services or information available through this platform meet your specific requirements.</li>
                        </ul>

                        <h5 className="fw-bold">4. Ownership & Intellectual Property</h5>
                        <ul>
                            <li>This website contains material which is either owned by or licensed to RASUTRIP. This includes, but is not limited to, the design, layout, look, appearance, and graphics.</li>
                            <li>Reproduction is prohibited, except in accordance with the copyright notice stated in these terms.</li>
                        </ul>

                        <h5 className="fw-bold">5. Trademarks</h5>
                        <ul>
                            <li>All trademarks displayed on this site, which are not the property of RASUTRIP or licensed to us, are acknowledged on the website.</li>
                        </ul>

                        <h5 className="fw-bold">6. Unauthorized Usage</h5>
                        <ul>
                            <li>Unauthorized use of this website may lead to claims for damages and/or criminal prosecution.</li>
                        </ul>

                        <h5 className="fw-bold">7. External Links</h5>
                        <ul>
                            <li>Occasionally, RASUTRIP.com may include links to other websites for additional information or convenience.</li>
                            <li>These links do not imply endorsement, and we have no responsibility for the content or services of the linked websites.</li>
                        </ul>

                        <h5 className="fw-bold">8. Linking Policy</h5>
                        <ul>
                            <li>You may not create a link to this website from any other website or document without prior written consent from RASUTRIP.</li>
                        </ul>

                        <h5 className="fw-bold">9. Legal Jurisdiction</h5>
                        <ul>
                            <li>Your use of this website and any dispute arising from such use is governed by the laws of India and subject to the jurisdiction of Indian regulatory authorities.</li>
                        </ul>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default TermsandConditions;
