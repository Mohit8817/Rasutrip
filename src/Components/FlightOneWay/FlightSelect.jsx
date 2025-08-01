import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const FlightSelect = ({rawSeatData}=[]) => {

   
  // seatData is SeatData[0][0].ul
  const seatRows = rawSeatData || [];
  console.log('seatRows',seatRows)

  return (
    <Container>
  <div className="text-center">
    {seatRows.map((row, rowIndex) => (
      <Row key={rowIndex} className="mb-2 justify-content-center">
        {row.map((seat, seatIndex) => (
          <Col key={seatIndex} xs="auto">
            <Card
              style={{
                padding: '10px',
                backgroundColor: seat.SeatClass.includes('booked') ? '#ccc' : '#d4edda',
                color: '#000',
                textAlign: 'center',
                minWidth: '40px'
              }}
            >
              {seat.SeatNo}
            </Card>
          </Col>
        ))}
      </Row>
    ))}
  </div>
</Container>

  );
};

export default FlightSelect;
