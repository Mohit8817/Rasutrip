import React, { useState, useRef } from 'react';
import { Container, Row, Col, Card, Overlay, Tooltip, Form } from 'react-bootstrap';

const SeatSelect = ({ rawSeatData = [], passengersData = [], onAssignSeat }) => {
  const seatRows = rawSeatData ? Object.values(rawSeatData) : [];

  console.log('passengersk', passengersData);
  const [tooltipTarget, setTooltipTarget] = useState(null);
  const [PassengersData, setPassengersData] = useState(passengersData); // Initialize with props
  
  const [clickedSeat, setClickedSeat] = useState(null);
  const overlayContainerRef = useRef(null);

  // Check if seat is already selected for any passenger
  const isSeatSelected = (seatCode) =>
    PassengersData?.some((p) => p.Seat && p.Seat[0]?.Code === seatCode);

  // Get which passenger has this seat
  const getPassengerForSeat = (seatCode) =>
    PassengersData?.find((p) => p.Seat && p.Seat[0]?.Code === seatCode);

  const getSeatColor = (seat) => {
    if (seat.SeatClass.includes('booked')) return '#ff4d4f'; // red
    if (isSeatSelected(seat.Code)) return '#fadb14'; // yellow
    return '#e0ffd1'; // green
  };

  const handleSeatClick = (seat, event) => {
    if (seat.SeatClass.includes('booked')) return;
    setClickedSeat(seat);
    setTooltipTarget(event.target);
  };

  const handlePassengerSelect = (passengerId) => {
    const updatedPassengers = PassengersData.map((passenger, index) => {
      // First, remove this seat from any other passenger
      if (passenger.Seat && passenger.Seat[0]?.Code === clickedSeat.Code && index !== passengerId) {
        return {
          ...passenger,
          Seat: null,
        };
      }
      
      // Then assign seat to selected passenger
      if (index === passengerId) {
        return {
          ...passenger,
          Seat: [clickedSeat],
        };
      }
      return passenger;
    });

    setPassengersData(updatedPassengers);
    onAssignSeat({ passengerId, clickedSeat }); // ensure this is needed
    
    // Keep popup open - don't close immediately
    // setClickedSeat(null);
    // setTooltipTarget(null);
  };

  const closeTooltip = () => {
    setClickedSeat(null);
    setTooltipTarget(null);
  };

  // Add null check here
  if (!PassengersData || PassengersData.length === 0) {
    return <div>Loading passengers...</div>;
  }

  return (
    <Container style={{ background: '#f5f7fd' }} ref={overlayContainerRef}>
      <Row>
        <Col md={7}>
          <p style={{ color: '#fadb14' }}>🟨 Selected Seat</p>
          <p style={{ color: '#52c41a' }}>🟩 Available Seat</p>
          <p style={{ color: '#ff4d4f' }}>🟥 Booked Seat</p>
        </Col>

        <Col md={5}>
          <img width={370} className='mb-[-10px]' src="/images/flightSmallFront.png" alt="Flight Front" />
          <div className="text-center pb-5 pt-[-15px]" style={{ background: 'white' }}>
            <h4 className="mb-5">{rawSeatData[0]?.[0]?.Origin} ➝ {rawSeatData[0]?.[0]?.Destination}</h4>
            {seatRows.map((row, rowIndex) => (
              <Row key={rowIndex} className="mb-2 justify-content-center">
                {row.map((seat, seatIndex) => {
                  const isSelected = isSeatSelected(seat.Code);
                  const passengerWithSeat = getPassengerForSeat(seat.Code);
                  
                  return (
                    <Col key={seatIndex} xs="auto">
                      <Card
                        style={{
                          padding: '6px',
                          backgroundColor: getSeatColor(seat),
                          color: '#000',
                          textAlign: 'center',
                          minWidth: '30px',
                          fontSize:'10px',
                          cursor: seat.SeatClass.includes('booked') ? 'not-allowed' : 'pointer',
                          border: isSelected ? '2px solid #fadb14' : '1px solid #ddd',
                          fontWeight: isSelected ? 'bold' : 'normal',
                        }}
                        onClick={(e) => handleSeatClick(seat, e)}
                      >
                        {seat.Code}
                        {isSelected && (
                          <div style={{ fontSize: '8px', color: '#000', marginTop: '2px' }}>
                            {passengerWithSeat?.type}
                          </div>
                        )}
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            ))}
          </div>
          <img width={370} src="/images/flightSmallTail.png" />
        </Col>
      </Row>

      {/* Background overlay to close tooltip */}
      {clickedSeat && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1040,
            backgroundColor: 'transparent'
          }}
          onClick={closeTooltip}
        />
      )}

      {/* Custom Seat Selection Popup */}
      <Overlay
        target={tooltipTarget}
        show={!!clickedSeat}
        placement="top"
        container={overlayContainerRef.current}
      >
        {(props) => (
          <div
            {...props}
            style={{
              ...props.style,
              zIndex: 1050,
              position: 'absolute'
            }}
          >
            <div className="custom-seat-popup">
              {/* Header with close button */}
              <div className="popup-header">
                <div className="seat-info">
                  <span className="seat-code">Seat {clickedSeat?.Code}</span>
                  <span className="seat-price">₹ {clickedSeat?.Price}.00</span>
                </div>
                <button className="close-btn" onClick={closeTooltip}>
                  ✕
                </button>
              </div>

              {/* Passenger list - Add additional null check */}
              <div className="passenger-list">
                {PassengersData && PassengersData.map((passenger, index) => {
                  const hasThisSeat = passenger.Seat && passenger.Seat[0]?.Code === clickedSeat?.Code;
                  const hasDifferentSeat = passenger.Seat && passenger.Seat[0]?.Code !== clickedSeat?.Code;
                  
                  return (
                    <div
                      key={index}
                      className={`passenger-item ${hasThisSeat ? 'selected' : ''}`}
                      onClick={() => handlePassengerSelect(index)}
                    >
                      <div className={`passenger-checkbox ${hasThisSeat ? 'checked' : ''}`}>
                        <span className="checkbox-icon">
                          {hasThisSeat ? '✓' : '✓'}
                        </span>
                      </div>
                      <div className="passenger-info">
                        <span className="passenger-name">{passenger.type}</span>
                        {hasThisSeat && (
                          <span className="seat-assignment">
                            {clickedSeat?.Code} | ₹ {clickedSeat?.Price}.00
                          </span>
                        )}
                        {hasDifferentSeat && (
                          <span className="seat-assignment current">
                            Current: {passenger.Seat[0]?.Code}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Overlay>

      {/* Add custom styles */}
      <style jsx>{`
        .custom-seat-popup {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          min-width: 280px;
          border: 1px solid #e0e0e0;
        }

        .popup-header {
          background: #000;
          color: white;
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .seat-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .seat-code {
          font-weight: bold;
          font-size: 16px;
        }

        .seat-price {
          font-size: 16px;
        }

        .close-btn {
          background: #ff4444;
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 12px;
          font-weight: bold;
        }

        .close-btn:hover {
          background: #ff6666;
        }

        .passenger-list {
          padding: 0;
        }

        .passenger-item {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          cursor: pointer;
          border-bottom: 1px solid #f0f0f0;
          transition: background-color 0.2s;
        }

        .passenger-item:hover {
          background-color: #f8f9fa;
        }

        .passenger-item.selected {
          background-color: #e6f7ff;
        }

        .passenger-item:last-child {
          border-bottom: none;
        }

        .passenger-checkbox {
          width: 20px;
          height: 20px;
          border: 2px solid #ccc;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          background: white;
        }

        .passenger-checkbox.checked {
          background: #52c41a;
          border-color: #52c41a;
        }

        .checkbox-icon {
          color: #ccc;
          font-size: 12px;
          font-weight: bold;
        }

        .passenger-checkbox.checked .checkbox-icon {
          color: white;
        }

        .passenger-info {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .passenger-name {
          font-size: 16px;
          font-weight: 500;
          color: #333;
        }

        .seat-assignment {
          font-size: 14px;
          color: #666;
          margin-top: 2px;
        }

        .seat-assignment.current {
          color: #faad14;
          font-weight: 500;
        }

        .passenger-item:hover .passenger-checkbox {
          border-color: #007bff;
        }

        .passenger-item:hover .checkbox-icon {
          color: #007bff;
        }

        .passenger-item.selected:hover .passenger-checkbox {
          border-color: #52c41a;
        }

        .passenger-item.selected:hover .checkbox-icon {
          color: white;
        }
      `}</style>
    </Container>
  );
};

export default SeatSelect;