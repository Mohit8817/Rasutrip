import React from 'react';
import FlightCard from './FlightCards';

const flights = [
  {
    airline: 'Ai Express',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Air_India_Express_Logo.svg/2560px-Air_India_Express_Logo.svg.png',
    flightNumber: 'IX-1163',
    departTime: '21:10',
    departDate: '28 Jun',
    stop: 'Non Stop(s)',
    duration: '2 h 30 m',
    arriveTime: '23:40',
    arriveDate: '28 Jun',
    price: '19788',
    tag: 'Xpress_Biz',
    classType: 'Business',
    refund: 'Refundable',
    action: 'BOOK',
    seatsLeft: 5,
  },
  {
    airline: 'Indigo',
    logo: 'https://1000logos.net/wp-content/uploads/2021/05/IndiGo-Logo.png',
    flightNumber: '6E-6218',
    departTime: '06:00',
    departDate: '28 Jun',
    stop: 'Non Stop(s)',
    duration: '2 h 10 m',
    arriveTime: '08:10',
    arriveDate: '28 Jun',
    price: '44050',
    tag: 'STRETCH',
    classType: 'Business',
    refund: 'Refundable',
    action: 'View Prices',
    seatsLeft: 6,
  },
  // Add more as needed
];

const FlightList = () => {
  return (
    <div className="my-4">
      <h5 className="mb-3">Showing Result {flights.length} of 82 Flights</h5>
      {flights.map((flight, idx) => (
        <FlightCard key={idx} flight={flight} />
      ))}
    </div>
  );
};

export default FlightList;
