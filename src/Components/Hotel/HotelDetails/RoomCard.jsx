import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "react-bootstrap-icons";
import "./HotelDetails.css";

const RoomCard = () => {
  const navigate = useNavigate();

  const handleBookNow = () => {
    navigate("/HotelDetail"); // Update path if different
  };

  return (
    <div>
      <h5 className="fw-bold mb-3">Rooms :</h5>
      <div className="border rounded bg-white p-3 d-flex justify-content-between align-items-center flex-wrap">
        {/* Left Side */}
        <div>
          <div className="fw-bold">Apartment</div>
          <div>
            <a href="/" className="text-decoration-underline text-purple">Room Information</a>
          </div>
          <div className="fw-bold mt-2 text-dark">₹3843.66</div>
        </div>

        {/* Right Side */}
        <div className="text-end ms-auto d-flex flex-column align-items-end">
          <div className="text-success d-flex align-items-center mb-2">
            <CheckCircle className="me-1" size={16} />
            <span className="small">ROOM ONLY</span>
          </div>
          <button className="btn-red" onClick={handleBookNow}>Book Now</button>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
