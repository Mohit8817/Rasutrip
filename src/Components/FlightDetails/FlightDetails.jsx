import React, { useEffect, useState, useMemo } from 'react';
import { Container, Row, Col, Modal, Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import BookingSteps from './BookingSteps';
import FlightInfo from './FlightInfo';
import FareSummary from './FareSummary';
import PromoCodeBox from './PromoCodeBox';
import { fetchFareRules } from '../APIS/FlightApi/FlightApi';
import FlightLoader from '../FlightLoader/FlightLoader';
import RoundFlightInfo from './RoundFlightInfo';
import MultiCity from './MultiCity';

const useFareRules = (fareId) => {
    const [fareRules, setFareRules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const userIp = localStorage.getItem("UserIp") || "";
    const searchToken = localStorage.getItem("searchToken") || "";

    const farePayload = useMemo(() => ({
        UserIp: userIp,
        ResultIndex: fareId ,
        SearchTokenId: searchToken
    }), [userIp, searchToken, fareId]);

    const fetchData = async () => {
        try {
            const res = await fetchFareRules(farePayload);
            if (res?.Error?.ErrorCode === 0 && Array.isArray(res?.Result)) {
                setFareRules(res.Result);
            } else {
                console.warn("API returned error or empty result:", res?.Error?.ErrorMessage);
                setFareRules([]);
            }
        } catch (err) {
            console.error("API call failed:", err);
            setError(err);
            setFareRules([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // if (farePayload.ResultIndex) {
            fetchData();
        // }
    }, []);

    return { fareRules, loading, error };
};


const FlightDetails = () => {
    
    const location = useLocation();
    const navigate = useNavigate();
    let {
        SelectedFare,
        FareData = {},
        state,
        journeyType,
        selectedFlights = {}
    } = location?.state || {};
    let finalFareId = null;
    let finalFareData = null;
    if (journeyType === 'roundtrip') {
        finalFareData = selectedFlights;
        finalFareId =  SelectedFare.onward? SelectedFare?.onward?.FareId:SelectedFare?.FareId;
    } else if (journeyType == 'oneway') {
        finalFareData = SelectedFare;
        finalFareId = SelectedFare?.FareId;
    } else if (journeyType === 'multicity') {
        finalFareData = selectedFlights;
        finalFareId = SelectedFare?.FareId;
    } else {
        console.warn('Unknown journey type:', journeyType);
    }

    const { fareRules, loading, error } = useFareRules(finalFareId);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        const res = localStorage.getItem('user');
        const authObj = res ? JSON.parse(res) : null;
        const authed = !!authObj;
        setIsAuth(authed);
        setShowLoginModal(!authed);
    }, []);

    return (
        <div>
            <Container style={{ marginTop: '4rem' }}>
                {loading ? (
                    <>
                        {loading && <p className="text-center text-primary mt-4"><FlightLoader message="Searching Fare Rules" /></p>}
                        {error && <p className="text-center text-danger mt-4">Error fetching fare rules.</p>}</>

                ) : (
                    <>
                        <Row>
                            <div>
                                <BookingSteps activeIndex={0} />
                            </div>
                        </Row>


                        <>
                            <Row>
                                {journeyType == 'roundtrip' ? (
                                    <Col lg={9}>
                                        <RoundFlightInfo Faresummary={SelectedFare} FareData={FareData} Selected={SelectedFare} SelectedFare={finalFareData} fareRules={fareRules} />

                                    </Col>
                                ) : journeyType === "oneway" ? (
                                    <>
                                        <Col lg={9}>
                                            <FlightInfo FareData={FareData} SelectedFare={SelectedFare} fareRules={fareRules} />

                                        </Col>
                                    </>
                                ) : (
                                    <Col lg={9}>
                                        <MultiCity FareData={FareData} SelectedFare={SelectedFare} fareRules={fareRules} />

                                    </Col>
                                )

                                }



                                <Col lg={3}>
                                    <FareSummary SelectedFare={SelectedFare} />
                                    {/* <PromoCodeBox /> */}
                                </Col>
                            </Row>
                        </>


                    </>
                )}

                <Modal
                    show={showLoginModal}
                    // onHide={() => setShowLoginModal(false)}
                    backdrop="static"
                    keyboard={false}
                    centered
                >
                    <Modal.Header >
                        <Modal.Title  className='flex w-full text-center justify-content-center ' >
                            <div> 
                                Sign in required </div>
                            </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className='text-center'>Create or sign in to your account</Modal.Body>
                    <Modal.Footer>
                        {/* <Button variant="secondary" onClick={() => setShowLoginModal(false)}>
                            Cancel
                        </Button> */}
                        <Button variant="danger" onClick={() => navigate('/login/customer')}>
                            Go to Login or Signup
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </div>
    );
};

export default FlightDetails;
