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

  const handleBookNow = async (room) => {
    if (room.AvailabilityType !== "Confirm") {
      alert("⚠️ This room is not available. Please choose another.");
      return;
    }

    setLoadingRoomId(room.RoomId);

    const blockPayload = {
      UserIp: payload.UserIp,
      HotelCode: payload.HotelCode,
      ResultIndex: payload.ResultIndex,
      SearchTokenId: payload.SearchTokenId,
      HotelName: hotel?.HotelName,
      NoOfRooms: 1,
      HotelRoomsDetails: [room],
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

          return (
            <div
              key={idx}
              className="border rounded bg-white p-3 d-flex justify-content-between align-items-center flex-wrap mb-3"
            >
              <div>
                <div className="fw-bold">{room.RoomTypeName || "Room"}</div>
                <div className="small text-muted mb-1">
                  {hotel.checkInDate} → {hotel.checkOutDate} •{" "}
                  {hotel.nights} Night
                </div>
                <div className="small text-muted mb-2">
                  {hotel.guests} Guest • {hotel.rooms} Room
                </div>
                <div className="fw-bold text-dark mb-2">
                  ₹{offeredPrice.toLocaleString()}
                </div>

                {room?.IsPANMandatory && (
                  <div className="text-danger small">
                    ⚠️ PAN card is mandatory for booking this room.
                  </div>
                )}
              </div>

              <div className="text-end ms-auto d-flex flex-column align-items-end">
                <div className="text-success d-flex align-items-center mb-2">
                  <CheckCircle size={16} className="me-1" />
                  <span className="small">
                    {room.Inclusion?.[0] ||
                      room.RatePlanName ||
                      "ROOM ONLY"}
                  </span>
                </div>

                <button
                  className="btn btn-danger btn-sm px-4"
                  onClick={() => handleBookNow(room)}
                  disabled={loadingRoomId === room.RoomId}
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
