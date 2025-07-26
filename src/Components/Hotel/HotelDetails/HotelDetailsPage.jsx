import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import Heading from "./Heading";
import ImageGallery from "./ImageGallery";
import BookingInfoCard from "./BookingInfoCard";
import RoomCard from "./RoomCard";
import Amenities from "./Amenities";
import AboutHotel from "./AboutHotel";
import {
  fetchHotelInfo,
  fetchRoomInfo,
  blockRoom,
} from "../../APIS/HotelApi/HotelAPi";
import HotelLoader from "../HotelLoaderCard/HotelLoader";

const HotelDetailsPage = () => {
  const { state } = useLocation();
  const { hotel, searchDetails } = state || {};

  const [hotelData, setHotelData] = useState(null);
  const [roomData, setRoomData] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [blockedRoomData, setBlockedRoomData] = useState(null);
  const [blockStatus, setBlockStatus] = useState(null);

  useEffect(() => {
    const getHotelDetails = async () => {
      if (!hotel?.ResultIndex || !hotel?.HotelCode || !hotel?.SearchTokenId) {
        console.error("❌ Missing hotel identifiers:", hotel);
        return;
      }

      const payload = {
        ...hotel,
        UserIp: "49.36.217.215",
        ResultIndex: hotel.ResultIndex,
        HotelCode: hotel.HotelCode,
        SearchTokenId: hotel.SearchTokenId,
      };

      try {
        const hotelInfo = await fetchHotelInfo(payload);
        const roomInfoResponse = await fetchRoomInfo(payload);
        const roomInfo = roomInfoResponse?.Result?.HotelRoomsDetails || [];

        setHotelData(hotelInfo);
        setRoomData(roomInfo);
      } catch (err) {
        console.error("❌ Failed to fetch hotel or room info:", err);
      }
    };

    getHotelDetails();
  }, [hotel]);

  if (!hotelData) {
    return (
      <div className="d-flex justify-content-center align-items-center mt-5 pt-5">
        <div className="p-5">
          <HotelLoader />
        </div>
      </div>
    );
  }

  return (
    <Container className="mt-5 pt-5 innerpagecontainer">
      <Row>
        <Col>
          <Heading
            name={hotelData.HotelName}
            location={hotelData.Address}
            rating={hotelData.StarRating}
          />
        </Col>
      </Row>

      <Row className="mt-3">
        <Col lg={8}>
          <ImageGallery images={hotelData.Images || []} />

          <RoomCard
            roomData={roomData}
            hotel={{
              ...hotel,
              HotelName: hotelData?.HotelName,
              checkInDate: searchDetails?.checkIn,
              checkOutDate: searchDetails?.checkOut,
              nights: searchDetails?.nights,
              rooms: searchDetails?.rooms,
              guests: searchDetails?.guests,
              adult: searchDetails?.adult,
              child: searchDetails?.child,
              city: searchDetails?.city,
            }}
            payload={{
              UserIp: "49.36.217.215", // optionally use real IP
              ResultIndex: hotel?.ResultIndex,
              HotelCode: hotel?.HotelCode,
              SearchTokenId: hotel?.SearchTokenId,
            }}
            onRoomSelect={({
              baseFare,
              tax,
              serviceCharges,
              gst,
              room,
            }) => {
              // ❌ Don't block room here, already done in RoomCard
              setSelectedRoom(room);
              setSelectedPrice({ baseFare, tax, serviceCharges, gst });

              // You can update UI here if needed, but avoid blocking API call
              // Any further logic like showing success banner can be done here
            }}
          />


          {blockStatus === "success" && (
            <div className="alert alert-success mt-3">
              ✅ Room successfully blocked. You can proceed to payment.
            </div>
          )}
          {blockStatus === "unavailable" && (
            <div className="alert alert-warning mt-3">
              ⚠️ Room is not available anymore. Please choose another.
            </div>
          )}
          {blockStatus === "error" && (
            <div className="alert alert-danger mt-3">
              ❌ Something went wrong while blocking the room.
            </div>
          )}

          <Amenities facilities={hotelData.HotelFacilities || []} />
          <AboutHotel description={hotelData.Description || ""} />
        </Col>

        <Col lg={4}>
          <BookingInfoCard searchDetails={searchDetails} />
          <div className="map-placeholder mt-2">
            <iframe
              title="hotel-map"
              width="100%"
              height="400"
              frameBorder="0"
              style={{ border: 0 }}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(
                hotelData.Address || "India"
              )}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
              allowFullScreen
            />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default HotelDetailsPage;
