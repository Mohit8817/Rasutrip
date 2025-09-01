import React, { useState } from 'react';
import HotelDetailInfo from './HotelDetailInfo';
import HotelStep from '../HotelStep';
import { Container, Row, Col } from 'react-bootstrap';
import FareSummaryCard from '../FareSummaryCard';
import { useLocation } from "react-router-dom";

const HotelDetail = () => {
    const [selectedPrice, setSelectedPrice] = useState(null);

    const handleRoomSelect = (priceData) => {
        setSelectedPrice(priceData);
    };

    const location = useLocation();

    // Extract all necessary data from location state
    const {
        priceDetails,
        blockedRoomData,
        hotel,
        room,
        rooms,
        guestDetails,
        searchDetails,
        totalGuests,
        roomCombination,
        payload,
        isPANMandatory
    } = location.state || {};

    console.log("🏨 HotelDetail - Location State:", location.state);
    console.log("💰 HotelDetail - Price Details:", priceDetails);
    console.log("🛏️ HotelDetail - Blocked Room Data:", blockedRoomData);

    // Use the data from navigation state or fallback values
    const finalGuestDetails = guestDetails || searchDetails || {
        adult: 1,
        child: 0,
        rooms: 1,
        nights: 1,
        guests: 1
    };

    const selectedRoom = rooms || (room ? [room] : []);
    const finalPriceDetails = selectedPrice || priceDetails;

    return (
        <Container className=''>
            <Row>
                <HotelStep activeIndex={0} />
            </Row>

            <Row className='mt-3'>
                <Col lg={9}>
                    <HotelDetailInfo
                        onRoomSelect={handleRoomSelect}
                        hotel={hotel}
                        room={room}
                        rooms={rooms}
                        guestDetails={finalGuestDetails}
                        payload={payload}
                        isPANMandatory={isPANMandatory}
                    />
                </Col>

                <Col lg={3}>
                    <FareSummaryCard
                        searchDetails={finalGuestDetails}
                        selectedRooms={selectedRoom}
                        priceDetails={finalPriceDetails}
                        blockedRoomData={blockedRoomData}
                        appliedCoupon={null}
                        couponDiscount={0}
                    />


                </Col>
            </Row>
        </Container>
    );
};

export default HotelDetail;