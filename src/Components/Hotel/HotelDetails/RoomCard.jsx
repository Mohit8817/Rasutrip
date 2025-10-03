import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "react-bootstrap-icons";
import { blockRoom } from "../../APIS/HotelApi/HotelAPi";

// Loading Popup Component
const LoadingPopup = ({ isVisible, roomName, roomCount }) => {
  if (!isVisible) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 9999,
        backdropFilter: 'blur(3px)'
      }}
    >
      <div
        className="bg-white rounded-4 p-4 text-center shadow-lg"
        style={{ maxWidth: '500px', width: '90%' }}
      >
        {/* Main Message */}
        <h5 className="fw-bold text-dark mb-2">
          Blocking Your Room{roomCount > 1 ? 's' : ''}...
        </h5>

        <p className="text-muted mb-3">
          Please wait while we secure <strong>"{roomName}"</strong> {roomCount > 1 ? `(${roomCount} rooms)` : ''} for you
        </p>

        {/* Warning Message */}
        <div className="alert alert-danger py-2 mb-3" role="alert">
          <strong>Please don't refresh the page!</strong>
        </div>

        {/* Progress Message */}
        <div className="text-muted small">
          <div className="d-flex align-items-center justify-content-center">
            <div className="spinner-grow spinner-grow-sm text-danger me-2" role="status"></div>
            <span>Processing your booking request...</span>
          </div>
        </div>

        {/* Decorative dots */}
        <div className="mt-3">
          <span className="text-danger">• • •</span>
        </div>
      </div>
    </div>
  );
};

const RoomCard = ({
  roomData = [],
  hotel = {},
  payload = {},
  onRoomSelect,
  onBlockStatusChange,
}) => {
  const navigate = useNavigate();
  const [loadingRoomId, setLoadingRoomId] = useState(null);
  const [loadingRoomName, setLoadingRoomName] = useState("");

  console.log("🛏️ RoomCard - Hotel Data:", hotel);
  console.log("🛏️ RoomCard - Room Data:", roomData);

  const isPANMandatory = (room) => {
    return (
      room?.IsPANMandatory === true ||
      room?.IsPANMandatory === "true" ||
      room?.IsPANMandatory === 1
    );
  };

  // ✅ NEW: Function to find room combinations based on selected room
  const findRoomCombination = (selectedRoomIndex, roomCombinations, requiredRooms = 1) => {
    if (!roomCombinations?.RoomCombination || requiredRooms === 1) {
      return [selectedRoomIndex];
    }

    // Find combination that includes the selected room index
    for (const combination of roomCombinations.RoomCombination) {
      if (combination.RoomIndex && combination.RoomIndex.includes(selectedRoomIndex)) {
        // Return only the number of rooms needed
        return combination.RoomIndex.slice(0, requiredRooms);
      }
    }

    // Fallback: return just the selected room if no combination found
    return [selectedRoomIndex];
  };

  // ✅ NEW: Function to get room details by index
  const getRoomByIndex = (roomIndex) => {
    return roomData.find(room => room.RoomIndex === roomIndex);
  };

  // ✅ UPDATED: Function to calculate total price for multiple rooms using PublishedPrice
  const calculateTotalPrice = (roomIndexes) => {
    let totalPublishedPrice = 0;
    let totalTax = 0;

    roomIndexes.forEach(index => {
      const room = getRoomByIndex(index);
      if (room) {
        // ✅ Use PublishedPrice instead of OfferedPrice
        totalPublishedPrice += Number(room?.Price?.PublishedPrice || 0);
        totalTax += Number(room?.Price?.Tax || 0);
      }
    });

    return { totalPublishedPrice, totalTax };
  };


  const handleBookNow = async (room, roomCombinations = null) => {
    if (room.AvailabilityType !== "Confirm") {
      alert("⚠️ This room is not available. Please choose another.");
      return;
    }

    // Calculate total adults properly
    let totalAdults = hotel?.adult || 1;
    const requiredRooms = hotel?.rooms || 1;

    // Try to get from roomDetails if available
    if (hotel?.searchDetails?.roomDetails && Array.isArray(hotel.searchDetails.roomDetails)) {
      totalAdults = hotel.searchDetails.roomDetails.reduce((sum, r) => sum + (r.Adult || r.adults || 0), 0);
    }

    console.log("👥 Total Adults for PAN check:", totalAdults);
    console.log("🏨 Required Rooms:", requiredRooms);

    // Find room combination based on selected room
    const selectedRoomIndexes = findRoomCombination(
      room.RoomIndex,
      roomCombinations,
      requiredRooms
    );

    console.log("🔗 Selected Room Combination:", selectedRoomIndexes);

    // Show loading popup
    setLoadingRoomId(room.RoomId);
    setLoadingRoomName(room.RoomTypeName || "Selected Room");

    // Build HotelRoomsDetails array for multiple rooms
    const hotelRoomsDetails = selectedRoomIndexes.map(roomIndex => ({
      RoomIndex: roomIndex,
    }));

    // Enhanced block payload with multiple rooms support
    const blockPayload = {
      UserIp: payload.UserIp || "49.36.217.215",
      HotelCode: payload.HotelCode,
      ResultIndex: payload.ResultIndex,
      SearchTokenId: payload.SearchTokenId,
      HotelName: hotel?.HotelName,
      NoOfRooms: requiredRooms,
      HotelRoomsDetails: hotelRoomsDetails,
    };

    console.log("📤 Block Room Payload:", blockPayload);

    try {
      const blockRes = await blockRoom(blockPayload);

      console.log("📥 Block Room Response:", blockRes);

      if (blockRes?.Error?.ErrorCode === 0) {
        // ✅ Calculate total price for all selected rooms using PublishedPrice
        const { totalPublishedPrice, totalTax } = calculateTotalPrice(selectedRoomIndexes);

        // Get all room details for the combination
        const selectedRooms = selectedRoomIndexes.map(index => getRoomByIndex(index)).filter(Boolean);

        // Check if any room requires PAN
        const anyPANMandatory = selectedRooms.some(r => isPANMandatory(r));

        // ✅ Use the final block room response PublishedPrice as source of truth
        const finalPublishedPrice = blockRes?.Result?.[0]?.Price?.PublishedPrice || totalPublishedPrice;
        const vendorCommissionPercentage = blockRes?.Result?.[0]?.Price?.rasutripCommissionPercentage ||
          hotel?.rasutripCommissionPercentage || ''; 

        // ✅ Calculate vendor commission amount
        const vendorCommissionAmount = (finalPublishedPrice * vendorCommissionPercentage) / 100;
        const convenienceFee = 150; // Fixed convenience fee

        // ✅ Calculate customer final price
        const customerPrice = finalPublishedPrice + convenienceFee;

        // ✅ Calculate vendor payment (what we pay to hotel)
        const vendorPayment = finalPublishedPrice - vendorCommissionAmount;

        // ✅ Our profit calculation
        const ourProfit = customerPrice - finalPublishedPrice;

        console.log("💰 Pricing Breakdown:", {
          finalPublishedPrice,
          vendorCommissionPercentage,
          vendorCommissionAmount,
          convenienceFee,
          customerPrice,
          vendorPayment,
          ourProfit
        });

        onRoomSelect?.({
          baseFare: finalPublishedPrice, // Use final PublishedPrice from block response
          tax: totalTax,
          serviceCharges: 0,
          gst: 0,
          room: selectedRooms[0], // Primary room for display
          rooms: selectedRooms, // All selected rooms
          hotel,
          isPANMandatory: anyPANMandatory,
          roomCombination: selectedRoomIndexes,
          // ✅ NEW: Add commission data
          vendorCommission: vendorCommissionAmount,
          vendorCommissionPercentage,
          convenienceFee,
          customerTotalPrice: customerPrice,
          vendorPayment,
          ourProfit,
        });

        onBlockStatusChange?.("success");

        // Enhanced navigation with complete pricing data
        navigate("/HotelDetail", {
          state: {
            hotel: {
              ...hotel,
              totalAdults, // Pass calculated total adults
            },
            room: selectedRooms[0], // Primary room
            rooms: selectedRooms, // All selected rooms
            roomCombination: selectedRoomIndexes,
            priceDetails: {
              baseFare: finalPublishedPrice, // Use final PublishedPrice
              tax: totalTax,
              serviceCharges: 0,
              gst: 0,
              // ✅ NEW: Commission pricing data
              vendorCommission: vendorCommissionAmount,
              vendorCommissionPercentage,
              convenienceFee,
              customerTotalPrice: customerPrice,
              vendorPayment,
              ourProfit,
              publishedPrice: finalPublishedPrice, // Final published price
            },
            totalGuests: hotel?.guests || (hotel?.adult || 0) + (hotel?.child || 0),
            guestDetails: {
              adult: totalAdults,
              child: hotel?.child || 0,
              rooms: requiredRooms,
              nights: hotel?.nights || 1,
              city: hotel?.city || '',
              checkInDate: hotel?.checkInDate || '',
              checkOutDate: hotel?.checkOutDate || '',
              roomDetails: hotel?.searchDetails?.roomDetails || [],
            },
            searchDetails: hotel?.searchDetails || {
              adult: totalAdults,
              child: hotel?.child || 0,
              rooms: requiredRooms,
              nights: hotel?.nights || 1,
              guests: hotel?.guests || totalAdults,
              city: hotel?.city || '',
              checkIn: hotel?.checkInDate || '',
              checkOut: hotel?.checkOutDate || '',
            },
            payload: blockPayload,
            blockedRoomData: blockRes?.Result,
            isPANMandatory: anyPANMandatory,
          },
        });
      } else if (blockRes?.Error?.ErrorCode === 5) {
        onBlockStatusChange?.("unavailable");
        alert("⚠️ Room no longer available. Please select another.");
      } else {
        onBlockStatusChange?.("error");
        alert("❌ Failed to block room: " + (blockRes?.Error?.ErrorMessage || "Unknown error"));
      }
    } catch (err) {
      console.error("❌ BlockRoom error:", err);
      onBlockStatusChange?.("error");
      alert("❌ Something went wrong while blocking the room.");
    } finally {
      setLoadingRoomId(null);
      setLoadingRoomName("");
    }
  };

  const availableRooms = roomData.filter(
    (room) => room.AvailabilityType === "Confirm"
  );

  // ✅ Get display values for UI
  const displayGuests = hotel?.guests || (hotel?.adult || 1) + (hotel?.child || 0);
  const displayAdults = hotel?.adult || 1;
  const displayChildren = hotel?.child || 0;
  const displayRooms = hotel?.rooms || 1;
  const displayNights = hotel?.nights || 1;

  // ✅ Get room combinations from the latest room data response
  const roomCombinations = roomData?.[0]?.RoomCombinations || null;

  return (
    <div>
      {/* Loading Popup */}
      <LoadingPopup
        isVisible={loadingRoomId !== null}
        roomName={loadingRoomName}
        roomCount={displayRooms}
      />

      <h5 className="fw-bold mb-3 mt-3">
        Rooms ({availableRooms.length} available)
        {displayRooms > 1 && (
          <small className="text-muted ms-2">
            (Booking {displayRooms} rooms)
          </small>
        )}
      </h5>

      {availableRooms.length > 0 ? (
        availableRooms.map((room, idx) => {
          // ✅ CHANGED: Use PublishedPrice instead of OfferedPrice
          const publishedPrice = Number(room?.Price?.PublishedPrice || 0);
          const panMandatory = isPANMandatory(room);
          const isCurrentRoomLoading = loadingRoomId === room.RoomId;

          // ✅ Calculate combination price for display using PublishedPrice
          let displayPrice = publishedPrice;
          if (displayRooms > 1 && roomCombinations) {
            const combination = findRoomCombination(room.RoomIndex, roomCombinations, displayRooms);
            const { totalPublishedPrice } = calculateTotalPrice(combination);
            displayPrice = totalPublishedPrice;
          }

          return (
            <div
              key={idx}
              className="border rounded bg-white p-3 d-flex justify-content-between align-items-center flex-wrap mb-3"
            >
              <div>
                <div className="fw-bold">{room.RoomTypeName || "Room"}
                  {panMandatory && (
                    <span className="">*</span>
                  )}
                </div>

                <div className="small text-muted mb-1">
                  {hotel.checkInDate} → {hotel.checkOutDate} • {displayNights} Night{displayNights > 1 ? 's' : ''}
                </div>
                <div className="small text-muted mb-2">
                  {displayGuests} Guest{displayGuests > 1 ? 's' : ''} ({displayAdults} Adult{displayAdults > 1 ? 's' : ''}, {displayChildren} Child{displayChildren !== 1 ? 'ren' : ''}) • {displayRooms} Room{displayRooms > 1 ? 's' : ''}
                </div>

                {/* ✅ UPDATED: Price display with PublishedPrice */}
                <div className="fw-bold text-dark mb-2">
                  ₹{displayPrice.toLocaleString()}
                  {displayRooms > 1 && (
                    <small className="text-muted ms-2">
                      (₹{publishedPrice.toLocaleString()} per room)
                    </small>
                  )}
                </div>

                {/* ✅ Show room amenities if available */}
                {room.Amenities && room.Amenities.length > 0 && (
                  <div className="small text-muted">
                    <strong>Amenities:</strong> {room.Amenities.join(', ')}
                  </div>
                )}
              </div>

              <div className="text-end ms-auto d-flex flex-column align-items-end">
                <div className="text-success d-flex align-items-center mb-2 d-none d-md-flex">
                  <CheckCircle size={16} className="me-1" />
                  <span className="small">
                    {room.Inclusion?.[0] || room.RatePlanName || "ROOM ONLY"}
                  </span>
                </div>

                {/* Mobile view - single line layout */}
                <div className="d-flex d-md-none align-items-center justify-content-between w-100 mb-2">
                  <div className="text-success d-flex align-items-center">
                    <CheckCircle size={16} className="me-1" />
                    <span className="small">
                      {room.Inclusion?.[0] || room.RatePlanName || "ROOM ONLY"}
                    </span>
                  </div>
                  <button
                    className="btn btn-danger btn-sm px-3 ms-2"
                    onClick={() => handleBookNow(room, roomCombinations)}
                    disabled={isCurrentRoomLoading}
                    title={panMandatory ? "Ensure all adults have valid PAN numbers" : `Book this room${displayRooms > 1 ? 's' : ''}`}
                  >
                    {isCurrentRoomLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                        Booking...
                      </>
                    ) : (
                      `Book ${displayRooms > 1 ? displayRooms + ' Rooms' : 'Now'}`
                    )}
                  </button>
                </div>

                {/* Desktop view - original layout */}
                <button
                  className="btn btn-danger btn-sm px-4 d-none d-md-block"
                  onClick={() => handleBookNow(room, roomCombinations)}
                  disabled={isCurrentRoomLoading}
                  title={panMandatory ? "Ensure all adults have valid PAN numbers" : `Book this room${displayRooms > 1 ? 's' : ''}`}
                >
                  {isCurrentRoomLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                      Booking...
                    </>
                  ) : (
                    `Book ${displayRooms > 1 ? displayRooms + ' Rooms' : 'Now'}`
                  )}
                </button>
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-4">
          <div className="text-muted">
            <i className="fas fa-bed fa-2x mb-2"></i>
            <h6>No Available Rooms</h6>
            <p>Sorry, no confirmed rooms are available for the selected dates.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomCard;