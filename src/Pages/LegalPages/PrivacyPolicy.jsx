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
                            At <strong>RASUTRIP.com</strong>, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you use our website and mobile application.
                        </p>

                        <h5 className="fw-bold mt-4">Information We Collect</h5>
                        <ul>
                            <li>Name and contact details (e.g., email address, phone number)</li>
                            <li>Demographic information such as preferences and interests</li>
                            <li>Location data, if permission is granted</li>
                            <li>Media files (photos, videos) for profile or travel submissions</li>
                            <li>Contact information if you choose to sync or share referrals</li>
                            <li>Usage data and device information to improve app performance</li>
                        </ul>

                        <h5 className="fw-bold mt-4">Permissions Required (Mobile App)</h5>
                        <p>Our mobile app may request access to the following Android permissions to provide you with a full-featured experience:</p>
                        <ul>
                            <li><strong>Location Access</strong><br /> 
                                ACCESS_COARSE_LOCATION and ACCESS_BACKGROUND_LOCATION: To provide location-based services and trip recommendations.
                            </li>
                            <li><strong>Internet Access</strong><br />
                                INTERNET: For app functionality, including connecting to our servers.
                            </li>
                            <li><strong>Device Features</strong><br />
                                WAKE_LOCK: To prevent the phone from sleeping during key app operations.<br />
                                FOREGROUND_SERVICE: To support real-time features while the app is active.
                            </li>
                            <li><strong>Contacts</strong><br />
                                READ_CONTACTS and WRITE_CONTACTS: To help you connect with friends and share travel plans (only with your permission).
                            </li>
                            <li><strong>Camera</strong><br />
                                CAMERA: To capture photos/videos for your travel posts or profile.
                            </li>
                            <li><strong>Media Access</strong><br />
                                READ_MEDIA_IMAGES and READ_EXTERNAL_STORAGE (up to Android 12): To allow uploading of images and videos to your travel profile.
                            </li>
                            <li><strong>Full-Screen Intent</strong><br />
                                USE_FULL_SCREEN_INTENT: To deliver important notifications effectively.
                            </li>
                        </ul>
                        <p className="text-muted">
                            <em>Note: You will be prompted for permission before any data is accessed. You may deny or revoke these permissions anytime through your device settings.</em>
                        </p>

                        <h5 className="fw-bold mt-4">Use of Information</h5>
                        <ul>
                            <li>Personalizing content and trip suggestions</li>
                            <li>Internal record keeping</li>
                            <li>Improving our services</li>
                            <li>Sending promotional emails only if you opt-in</li>
                            <li>Contacting you about updates or offers relevant to your interests</li>
                        </ul>

                        <h5 className="fw-bold mt-4">Marketing & Communication</h5>
                        <ul>
                            <li>You can opt out of direct marketing by unchecking the relevant box in our forms.</li>
                            <li>If you have previously agreed to receive marketing, you may unsubscribe at any time by contacting us via email.</li>
                            <li>We will <strong>never</strong> sell or lease your personal data to third parties without your permission unless required by law.</li>
                        </ul>

                        <h5 className="fw-bold mt-4">External Links</h5>
                        <p>
                            Our platform may contain links to external websites. Once you leave RASUTRIP.com, we are no longer responsible for the privacy or protection of your data on those sites. We encourage you to review their privacy policies separately.
                        </p>

                        <h5 className="fw-bold mt-4">Your Rights</h5>
                        <p>
                            If you believe that any information we hold about you is incorrect or incomplete, please contact us. We will promptly make the necessary corrections.
                        </p>

                        <h5 className="fw-bold mt-4">Policy Updates</h5>
                        <p>
                            RASUTRIP.com may revise this policy from time to time. Please check this page regularly to stay informed about any changes.
                        </p>

                        <p className="mt-4">
                            If you have any questions or concerns about this Privacy Policy, feel free to contact us directly at <strong>yourapp@rasutrip.com</strong>.
                        </p>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default PrivacyPolicy;
