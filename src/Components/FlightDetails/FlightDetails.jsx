import React, { useEffect, useState, useMemo } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';

import BookingSteps from './BookingSteps';
import FlightInfo from './FlightInfo';
import FareSummary from './FareSummary';
import PromoCodeBox from './PromoCodeBox';
import { fetchFareRules } from '../FlightApi/FlightApi';

const useFareRules = (fareId) => {
    const [fareRules, setFareRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const userIp = localStorage.getItem("UserIp") || "";
    const searchToken = localStorage.getItem("searchToken") || "";

    const farePayload = useMemo(() => ({
        UserIp: userIp,
        ResultIndex: fareId || "",
        SearchTokenId: searchToken
    }), [userIp, searchToken, fareId]);

    const fetchData = async () => {
        try {
            const res = await fetchFareRules(farePayload);
            console.log("Fare Rule API Response:", res);

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
        if (farePayload.ResultIndex) {
            fetchData();
        }
    }, [farePayload]);

    return { fareRules, loading, error };
};


const FlightDetails = () => {
    const location = useLocation();

    const { SelectedFare, FareData } = location?.state || {};
    console.log("FareData details ", FareData, "SelectedFare", SelectedFare)
    const { fareRules, loading, error } = useFareRules(SelectedFare?.FareId);
    console.log("fareRules in details", fareRules);
    return (
        <div>
            <Container style={{ marginTop: '8rem' }}>
                <Row>
                    <div>
                        <BookingSteps activeIndex={0} />
                    </div>
                </Row>
                <Row>
                    <Col lg={9}>
                        <FlightInfo FareData={FareData} SelectedFare={SelectedFare} fareRules={fareRules} />
                    </Col>
                    <Col lg={3}>
                        <FareSummary SelectedFare={SelectedFare} />
                        <PromoCodeBox />
                    </Col>
                </Row>

                {loading && <p className="text-center text-primary mt-4">Loading fare rules...</p>}
                {error && <p className="text-center text-danger mt-4">Error fetching fare rules.</p>}
            </Container>
        </div>
    );
};

export default FlightDetails;
