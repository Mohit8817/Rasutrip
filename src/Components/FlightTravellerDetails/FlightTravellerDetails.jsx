import React, { useContext, useEffect, useState } from 'react'
import { Container, Row, Col, Modal, Button } from 'react-bootstrap';
import BookingSteps from '../FlightDetails/BookingSteps';
import FareSummary from '../FlightDetails/FareSummary';
import PromoCodeBox from '../FlightDetails/PromoCodeBox';
import TravellerInfo from './TravellerInfo';

import '../../Style/Pagescss/FlightResultsPage.css';
import { useLocation } from 'react-router-dom';
import { LocationContext } from '../Context/LocationContext';
import { useNavigate } from "react-router-dom";


const FlightTravellerDetails = () => {
    const location = useLocation();
    const { locationData, setLocationData } = useContext(LocationContext);
    const { SelectedFare, fareConfirmData, Faresummary, IsPriceChange } = location?.state || {}
    const [totalPrice, setTotalPrice] = useState(0);
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);

    let ChangeFareSummery = Faresummary
    useEffect(() => {
        if (IsPriceChange) {
            setShowModal(true);
        }
    }, [IsPriceChange]);
    const handleSelectAnother = () => {
        navigate("/");
    };
    const handleContinue = () => {
        const updatedSummary = {
            ...Faresummary,
            PublishedPrice: fareConfirmData.Fare.PublishedPrice,
            OfferedPrice: fareConfirmData.Fare.OfferedPrice,
            Fare: { ...fareConfirmData.Fare }, // replace entire Fare object
            FareBreakdown: { ...fareConfirmData.FareBreakdown }, // replace entire breakdown
        };

        ChangeFareSummery = updatedSummary
        localStorage.setItem("fareSummery", JSON.stringify(updatedSummary));
        setShowModal(false);
    };

    return (
        <div>
            <Container style={{ marginTop: '4rem' }}>

                <Row>
                    <div>
                        <BookingSteps activeIndex={1} />
                    </div>
                </Row>
                <Row>
                    <Col lg={9}>
                        <div >
                            <TravellerInfo Faresummary={ChangeFareSummery} SelectedFare={SelectedFare} fareConfirmData={fareConfirmData} />
                        </div>

                    </Col>
                    <Col lg={3}>
                        <div>
                            <FareSummary SelectedFare={Faresummary} />
                            {/* <PromoCodeBox /> */}

                        </div>
                    </Col>
                </Row>

            </Container>
            <Modal show={showModal} centered>
                <Modal.Header className='flex justify-center '>

                    <Modal.Title>Price has been changed</Modal.Title>


                </Modal.Header>
                <Modal.Body className="text-center">
                    {/* <img
                        src="https://cdn-icons-png.flaticon.com/512/1170/1170678.png"
                        alt="Price Change"
                        width={60}
                        className="mb-3"
                    /> */}
                    <p>
                        The Airline has increased the fare on this route.
                        Please note that airfares are dynamic and subject to change.
                        Select from the options below.
                    </p>

                    <div className="price-details text-start mt-3">
                        <div className="d-flex justify-content-between">
                            <strong>Updated Fare</strong>
                            <span>₹ {Faresummary?.PublishedPrice}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                            <strong>Original Fare</strong>
                            <span>₹ {fareConfirmData?.Fare?.PublishedPrice}</span>
                        </div>
                        <div className="d-flex justify-content-between text-danger">
                            <strong>Difference</strong>
                            <span>+ ₹ {(fareConfirmData?.Fare?.PublishedPrice - Faresummary?.PublishedPrice)}</span>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-between">
                    <Button variant="primary" onClick={handleSelectAnother}>
                        Select Another Flight
                    </Button>
                    <Button variant="danger" onClick={handleContinue}>
                        Continue
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default FlightTravellerDetails