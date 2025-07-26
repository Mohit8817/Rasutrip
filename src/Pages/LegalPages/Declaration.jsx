import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const Disclaimer = () => {
    return (
        <div className="terms-wrapper py-5">
            <Container className="rounded shadow p-4 bg-white">
                <Row>
                    <Col>
                        <h2 className="text-center fw-bold mb-4">Declaration – RASUTRIP.com</h2>

                        <p>
                            At RASUTRIP.com, we strive to ensure that all information on this website is accurate, up-to-date, and reliable. However, despite our best efforts, we do not guarantee the validity, quality, or pricing of the services and products displayed. All content is subject to change without prior notice.
                        </p>

                        <h5 className="fw-bold mt-4">Disclaimer of Accuracy</h5>
                        <ul>
                            <li>The information, software, products, and services displayed on this website may contain errors or inaccuracies, including typographical and pricing errors.</li>
                            <li>While we aim for accuracy, we do not guarantee the correctness of details related to flights, bus services, hotel listings, pricing, schedules, or photos.</li>
                            <li>All product descriptions and amenities are shared as received from third-party service providers.</li>
                        </ul>

                        <h5 className="fw-bold mt-4">No Warranties</h5>
                        <ul>
                            <li>The availability of flights, buses, hotels, and other travel products on RASUTRIP.com does not imply endorsement or recommendation by RASUTRIP or its partners.</li>
                            <li>All services and content are provided strictly “as is”, without any warranties—express or implied—including:
                                <ul>
                                    <li>Merchantability</li>
                                    <li>Fitness for a particular purpose</li>
                                    <li>Title and non-infringement</li>
                                </ul>
                            </li>
                        </ul>

                        <h5 className="fw-bold mt-4">Limitation of Liability</h5>
                        <ul>
                            <li>The airlines, bus operators, hotels, and other service providers listed on RASUTRIP.com are independent contractors and not agents of RASUTRIP.</li>
                            <li>We are not responsible for:
                                <ul>
                                    <li>Errors or omissions by service providers</li>
                                    <li>Delays, overbookings, cancellations, strikes, or force majeure events</li>
                                    <li>Any loss, personal injury, property damage, or expense arising from third-party actions</li>
                                </ul>
                            </li>
                            <li>No refunds will be issued in cases beyond our control, including acts of government or re-routing.</li>
                        </ul>

                        <h5 className="fw-bold mt-4">External Links & Ads</h5>
                        <ul>
                            <li>RASUTRIP.com may feature links to third-party websites, downloads, plugins, or advertisements. These are provided for your convenience only.</li>
                            <li>We do not control or review the content or practices of external websites and are not responsible for their accuracy or reliability.</li>
                            <li>The presence of a link or ad does not constitute endorsement, and users access them at their own risk.</li>
                        </ul>

                        <h5 className="fw-bold mt-4">Advertiser Interaction</h5>
                        <ul>
                            <li>Any communication, transactions, or participation in promotions with third-party advertisers is strictly between you and the advertiser.</li>
                            <li>RASUTRIP.com and its affiliates will not be liable for any loss or damage resulting from such interactions or advertisements displayed on our platform.</li>
                        </ul>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Disclaimer;
