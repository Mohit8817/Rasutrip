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

    // ✅ Debug log to see what data we're getting
    console.log("🏨 Hotel Details Page - Received Data:");
    console.log("Hotel:", hotel);
    console.log("SearchDetails:", searchDetails);

    useEffect(() => {
      const getHotelDetails = async () => {
        // ✅ Enhanced validation with better error messages
        if (!hotel?.ResultIndex && !hotel?.resultIndex) {
          console.error("❌ Missing ResultIndex in hotel data:", hotel);
          return;
        }
        if (!hotel?.HotelCode && !hotel?.id) {
          console.error("❌ Missing HotelCode/id in hotel data:", hotel);
          return;
        }
        if (!hotel?.SearchTokenId) {
          console.error("❌ Missing SearchTokenId in hotel data:", hotel);
          return;
        }

        // ✅ Support both old and new data formats
        const payload = {
          UserIp: "49.36.217.215",
          ResultIndex: hotel.ResultIndex || hotel.resultIndex,
          HotelCode: hotel.HotelCode || hotel.id,
          SearchTokenId: hotel.SearchTokenId,
        };

        console.log("📤 Hotel Info Payload:", payload);

        try {
          const hotelInfo = await fetchHotelInfo(payload);
          const roomInfoResponse = await fetchRoomInfo(payload);
          const roomInfo = roomInfoResponse?.Result?.HotelRoomsDetails || [];

          console.log("📥 Hotel Info Response:", hotelInfo);
          console.log("📥 Room Info Response:", roomInfo);

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
        <div className="d-flex justify-content-center align-items-center">
          <div className="">
            <HotelLoader />
          </div>
        </div>
      );
    }

    // ✅ Calculate guest details from multiple sources
    const getGuestDetails = () => {
      // Priority: hotel.searchDetails > searchDetails > fallback values
      const details = hotel?.searchDetails || searchDetails || {};
      
      let totalAdults = 0;
      let totalChildren = 0;
      
      // If roomDetails exists, calculate from it
      if (details.roomDetails && Array.isArray(details.roomDetails)) {
        totalAdults = details.roomDetails.reduce((sum, room) => sum + (room.Adult || room.adults || 0), 0);
        totalChildren = details.roomDetails.reduce((sum, room) => sum + (room.Child || room.children || 0), 0);
      }
      // Fallback to direct values
      else {
        totalAdults = details.adult || details.adultsCount || 1;
        totalChildren = details.child || details.childrenCount || 0;
      }

      return {
        adult: totalAdults,
        child: totalChildren,
        guests: totalAdults + totalChildren,
        rooms: details.rooms || 1,
        nights: details.nights || 1,
        city: details.city || '',
        checkInDate: details.checkIn || details.checkInDate || '',
        checkOutDate: details.checkOut || details.checkOutDate || '',
        roomDetails: details.roomDetails || []
      };
    };

    const guestDetails = getGuestDetails();
    
    console.log("👥 Calculated Guest Details:", guestDetails);

    return (
      <Container className="">
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
                // ✅ Pass calculated guest details
                ...guestDetails,
                // ✅ Ensure searchDetails is available
                searchDetails: hotel?.searchDetails || searchDetails || guestDetails,
              }}
              payload={{
                UserIp: "49.36.217.215",
                ResultIndex: hotel?.ResultIndex || hotel?.resultIndex,
                HotelCode: hotel?.HotelCode || hotel?.id,
                SearchTokenId: hotel?.SearchTokenId,
              }}
              onRoomSelect={({
                baseFare,
                tax,
                serviceCharges,
                gst,
                room,
              }) => {
                setSelectedRoom(room);
                setSelectedPrice({ baseFare, tax, serviceCharges, gst });
              }}
              onBlockStatusChange={setBlockStatus}
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
            <BookingInfoCard searchDetails={guestDetails} />
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