import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "react-bootstrap-icons";
import "./HotelDetails.css";

const RoomCard = ({ roomData = [] }) => {
  const navigate = useNavigate();

  console.log("🔍 roomData received in RoomCard:", roomData); // Add this!

  const handleBookNow = (room) => {
    navigate("/HotelDetail", {
      state: { room },
    });
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
            {/* Left Side */}
            <div>
              <div className="fw-bold">{room.RoomTypeName || "Room"}</div>
              <div>
                <a href="/" className="text-decoration-underline text-purple">
                  Room Information
                </a>
              </div>
              <div className="fw-bold mt-2 text-dark">
                ₹{room.Price?.OfferedPrice || "N/A"}
              </div>
            </div>

            {/* Right Side */}
            <div className="text-end ms-auto d-flex flex-column align-items-end">
              <div className="text-success d-flex align-items-center mb-2">
                <CheckCircle className="me-1" size={16} />
                <span className="small">
                  {room.Inclusion?.[0] || room.RatePlanName || "ROOM ONLY"}
                </span>
              </div>
              <button className="btn-red" onClick={() => handleBookNow(room)}>
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
