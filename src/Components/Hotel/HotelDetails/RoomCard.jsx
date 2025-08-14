import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "react-bootstrap-icons";
import { blockRoom } from "../../APIS/HotelApi/HotelAPi";

const RoomCard = ({
  roomData = [],
  hotel = {},
  payload = {},
  onRoomSelect,
  onBlockStatusChange,
}) => {
  const navigate = useNavigate();
  const [loadingRoomId, setLoadingRoomId] = useState(null);

  console.log("🛏️ RoomCard - Hotel Data:", hotel);
  console.log("🛏️ RoomCard - Room Data:", roomData);

  const isPANMandatory = (room) => {
    return (
      room?.IsPANMandatory === true ||
      room?.IsPANMandatory === "true" ||
      room?.IsPANMandatory === 1
    );
  };

  const isValidPANFormat = (pan) => {
    if (!pan || typeof pan !== "string") return false;
    const cleanPAN = pan.trim().toUpperCase();

    if (
      cleanPAN === "" ||
      cleanPAN === "NULL" ||
      cleanPAN === "UNDEFINED" ||
      cleanPAN.replace(/\s/g, "") === ""
    ) {
      return false;
    }

    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPAN);
  };

  const handleBookNow = async (room) => {
    if (room.AvailabilityType !== "Confirm") {
      alert("⚠️ This room is not available. Please choose another.");
      return;
    }

    // ✅ Calculate total adults properly
    let totalAdults = hotel?.adult || 1;
    
    // Try to get from roomDetails if available
    if (hotel?.searchDetails?.roomDetails && Array.isArray(hotel.searchDetails.roomDetails)) {
      totalAdults = hotel.searchDetails.roomDetails.reduce((sum, r) => sum + (r.Adult || r.adults || 0), 0);
    }

    console.log("👥 Total Adults for PAN check:", totalAdults);

    // ❌ PAN MANDATORY POPUP REMOVED - Direct booking without warning
    
    setLoadingRoomId(room.RoomId);

    // ✅ Enhanced block payload with better error handling
    const blockPayload = {
      UserIp: payload.UserIp || "49.36.217.215",
      HotelCode: payload.HotelCode,
      ResultIndex: payload.ResultIndex,
      SearchTokenId: payload.SearchTokenId,
      HotelName: hotel?.HotelName,
      NoOfRooms: hotel?.rooms || 1,
      HotelRoomsDetails: [
        {
          RoomIndex: room.RoomIndex || 1,
        },
      ],
    };

    console.log("📤 Block Room Payload:", blockPayload);

    try {
      const blockRes = await blockRoom(blockPayload);
      
      console.log("📥 Block Room Response:", blockRes);

      if (blockRes?.Error?.ErrorCode === 0) {
        const baseFare = Number(room?.Price?.OfferedPrice || 0);
        const tax = Number(room?.Price?.Tax || 0);

        onRoomSelect?.({
          baseFare,
          tax,
          serviceCharges: 0,
          gst: 0,
          room,
          hotel,
          isPANMandatory: isPANMandatory(room),
        });

        onBlockStatusChange?.("success");

        // ✅ Enhanced navigation with complete data
        navigate("/HotelDetail", {
          state: {
            hotel: {
              ...hotel,
              totalAdults, // ✅ Pass calculated total adults
            },
            room,
            priceDetails: {
              baseFare,
              tax,
              serviceCharges: 0,
              gst: 0,
            },
            totalGuests: hotel?.guests || (hotel?.adult || 0) + (hotel?.child || 0),
            guestDetails: {
              adult: totalAdults,
              child: hotel?.child || 0,
              rooms: hotel?.rooms || 1,
              nights: hotel?.nights || 1,
              city: hotel?.city || '',
              checkInDate: hotel?.checkInDate || '',
              checkOutDate: hotel?.checkOutDate || '',
              roomDetails: hotel?.searchDetails?.roomDetails || [],
            },
            searchDetails: hotel?.searchDetails || {
              adult: totalAdults,
              child: hotel?.child || 0,
              rooms: hotel?.rooms || 1,
              nights: hotel?.nights || 1,
              guests: hotel?.guests || totalAdults,
              city: hotel?.city || '',
              checkIn: hotel?.checkInDate || '',
              checkOut: hotel?.checkOutDate || '',
            },
            payload: blockPayload,
            blockedRoomData: blockRes?.Result,
            isPANMandatory: isPANMandatory(room),
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

  return (
    <div>
      <h5 className="fw-bold mb-3 mt-3">
        Rooms ({availableRooms.length} available)
      </h5>

      {availableRooms.length > 0 ? (
        availableRooms.map((room, idx) => {
          const offeredPrice = Number(room?.Price?.OfferedPrice || 0);
          const panMandatory = isPANMandatory(room);

          return (
            <div
              key={idx}
              className="border rounded bg-white p-3 d-flex justify-content-between align-items-center flex-wrap mb-3"
            >
              <div>
                <div className="fw-bold">{room.RoomTypeName || "Room"}</div>
                <div className="small text-muted mb-1">
                  {hotel.checkInDate} → {hotel.checkOutDate} • {displayNights} Night{displayNights > 1 ? 's' : ''}
                </div>
                <div className="small text-muted mb-2">
                  {displayGuests} Guest{displayGuests > 1 ? 's' : ''} ({displayAdults} Adult{displayAdults > 1 ? 's' : ''}, {displayChildren} Child{displayChildren !== 1 ? 'ren' : ''}) • {displayRooms} Room{displayRooms > 1 ? 's' : ''}
                </div>
                <div className="fw-bold text-dark mb-2">
                  ₹{offeredPrice.toLocaleString()}
                </div>

                {/* Enhanced PAN mandatory warning */}
                {panMandatory && (
                  <div className="alert alert-warning p-2 mb-2 small">
                    <strong>⚠️ PAN MANDATORY ROOM</strong><br />
                  
                  </div>
                )}

                {/* ✅ Show room amenities if available */}
                {room.RoomAmenities && room.RoomAmenities.length > 0 && (
                  <div className="small text-muted">
                    <strong>Amenities:</strong> {room.RoomAmenities.map(a => a.Name).join(', ')}
                  </div>
                )}
              </div>

              <div className="text-end ms-auto d-flex flex-column align-items-end">
                <div className="text-success d-flex align-items-center mb-2">
                  <CheckCircle size={16} className="me-1" />
                  <span className="small">
                    {room.Inclusion?.[0] || room.RatePlanName || "ROOM ONLY"}
                  </span>
                </div>

                {/* ✅ Show cancellation policy if available */}
                {room.CancellationPolicy && (
                  <div className="small text-muted mb-2">
                    {room.CancellationPolicy}
                  </div>
                )}

                <button
                  className="btn btn-danger btn-sm px-4"
                  onClick={() => handleBookNow(room)}
                  disabled={loadingRoomId === room.RoomId}
                  title={
                    panMandatory
                      ? "Ensure all adults have valid PAN numbers"
                      : "Book this room"
                  }
                >
                  {loadingRoomId === room.RoomId ? "Blocking..." : "Book Now"}
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