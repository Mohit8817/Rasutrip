import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "react-bootstrap-icons";

const RoomCard = ({ roomData = [], hotel, onRoomSelect }) => {
  const navigate = useNavigate();

  const handleBookNow = (room) => {
    const baseFare = Number(room?.Price?.OfferedPrice || 0);
    const tax = Number(room?.Price?.Tax || 0);

    if (onRoomSelect) {
      onRoomSelect({
        baseFare,
        tax,
        serviceCharges: 0,
        gst: 0,
        room,
        hotel,
      });

      // Navigate after selecting room
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
        },
      });

    }
  };

  return (
    <div>
      <h5 className="fw-bold mb-3">Rooms:</h5>

      {Array.isArray(roomData) && roomData.length > 0 ? (
        roomData.map((room, index) => (
          <div
            key={index}
            className="border rounded bg-white p-3 d-flex justify-content-between align-items-center flex-wrap mb-3"
          >
            <div>
              <div className="fw-bold">{room.RoomTypeName || "Room"}</div>
              <a href="/" className="text-decoration-underline text-purple">
                Room Information
              </a>
              <div className="fw-bold mt-2 text-dark">
                ₹{Number(room.Price?.OfferedPrice || 0).toLocaleString()}
              </div>
            </div>

            <div className="text-end ms-auto d-flex flex-column align-items-end">
              <div className="text-success d-flex align-items-center mb-2">
                <CheckCircle className="me-1" size={16} />
                <span className="small">
                  {room.Inclusion?.[0] || room.RatePlanName || "ROOM ONLY"}
                </span>
              </div>
              <button
                className="btn btn-danger btn-sm px-4"
                onClick={() => handleBookNow(room)}
              >
                Book Now
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-muted">No rooms available</p>
      )}
    </div>
  );
};

export default RoomCard;
