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

    // ✅ ENHANCED: Better PAN mandatory warning
    if (isPANMandatory(room)) {
      const totalAdults = hotel?.adult || 1;
      const warningMessage = `⚠️ PAN MANDATORY ROOM SELECTED\n\n` +
        `This room requires UNIQUE PAN numbers for ALL ${totalAdults} adult guest(s).\n\n` +
        `Important Requirements:\n` +
        `• Each adult must have a DIFFERENT PAN number\n` +
        `• PAN format: ABCDE1234F (5 letters + 4 digits + 1 letter)\n` +
        `• Duplicate PAN numbers will cause booking failure\n\n` +
        `Please ensure all passengers have valid, unique PAN cards before proceeding.`;

      alert(warningMessage);
    }

    setLoadingRoomId(room.RoomId);

    const blockPayload = {
      UserIp: payload.UserIp,
      HotelCode: payload.HotelCode,
      ResultIndex: payload.ResultIndex,
      SearchTokenId: payload.SearchTokenId,
      HotelName: hotel?.HotelName,
      NoOfRooms: 1,
      HotelRoomsDetails: [
        {
          RoomIndex: room.RoomIndex || 1,
        },
      ],
    };

    try {
      const blockRes = await blockRoom(blockPayload);

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

        navigate("/HotelDetail", {
          state: {
            hotel,
            room,
            priceDetails: {
              baseFare,
              tax,
              serviceCharges: 0,
              gst: 0,
            },
            totalGuests: hotel?.guests ?? 0,
            guestDetails: {
              adult: hotel?.adult,
              child: hotel?.child,
              rooms: hotel?.rooms,
              nights: hotel?.nights,
              city: hotel?.city,
              checkInDate: hotel?.checkInDate,
              checkOutDate: hotel?.checkOutDate,
            },
            payload,
            blockedRoomData: blockRes?.Result,
            isPANMandatory: isPANMandatory(room), // ✅ Pass this flag
          },
        });
      } else if (blockRes?.Error?.ErrorCode === 5) {
        onBlockStatusChange?.("unavailable");
        alert("⚠️ Room no longer available. Please select another.");
      } else {
        onBlockStatusChange?.("error");
        alert("❌ Failed to block room: " + blockRes?.Error?.ErrorMessage);
      }
    } catch (err) {
      console.error("❌ BlockRoom error", err);
      onBlockStatusChange?.("error");
      alert("❌ Something went wrong while blocking the room.");
    } finally {
      setLoadingRoomId(null);
    }
  };

  const availableRooms = roomData.filter(
    (room) => room.AvailabilityType === "Confirm"
  );

  return (
    <div>
      <h5 className="fw-bold mb-3">Rooms</h5>

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
                  {hotel.checkInDate} → {hotel.checkOutDate} • {hotel.nights} Night
                </div>
                <div className="small text-muted mb-2">
                  {hotel.guests} Guest • {hotel.rooms} Room
                </div>
                <div className="fw-bold text-dark mb-2">
                  ₹{offeredPrice.toLocaleString()}
                </div>

                {/* ✅ ENHANCED: Better PAN mandatory warning */}
                {panMandatory && (
                  <div className="alert alert-warning p-2 mb-2 small">
                    <strong>⚠️ PAN MANDATORY ROOM</strong><br />
                    All {hotel?.adult || 1} adult guest(s) need UNIQUE PAN numbers.<br />
                    <small className="text-muted">Duplicate PAN will cause booking failure.</small>
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
                  {loadingRoomId === room.RoomId ? "Blocking..." : "Book"}
                </button>
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-muted">No confirm-available rooms</p>
      )}
    </div>
  );
};

export default RoomCard;