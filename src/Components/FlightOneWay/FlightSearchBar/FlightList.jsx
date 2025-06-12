import React from 'react';
import FlightCard from './FlightCards';

const flights = [
  {
    logo: '',
    airline: 'Ai Express',
    flightNumber: 'IX-1163',
    seatsLeft: 5,
    departTime: '21:10',
    departDate: '28 Jun',
    departCity: 'DEL',
    duration: '2 h 30 m',
    arriveTime: '23:40',
    arriveDate: '28 Jun',
    arriveCity: 'BOM',
    price: 19788,
    tag: 'Xpress_Biz',
    classType: 'Business',
    refund: 'Refundable',
    action: 'BOOK',
    stop: 'Non Stop(s)',
  },
  {
    logo: '',
    airline: 'Indigo',
    flightNumber: '6E-6218',
    departTime: '06:00',
    departDate: '28 Jun',
    departCity: 'DEL',
    duration: '2 h 10 m',
    arriveTime: '08:10',
    arriveDate: '28 Jun',
    arriveCity: 'BOM',
    price: 44050,
    tag: 'STRETCH',
    classType: 'Business',
    refund: 'Refundable',
    action: 'View Prices',
    seatsLeft: 6,
    stop: 'Non Stop(s)',
  },
  {
    logo: '',
    airline: 'Vistara',
    flightNumber: 'UK-802',
    departTime: '14:25',
    departDate: '28 Jun',
    departCity: 'DEL',
    duration: '2 h 15 m',
    arriveTime: '16:40',
    arriveDate: '28 Jun',
    arriveCity: 'BOM',
    price: 18500,
    tag: 'Flexi Fare',
    classType: 'Economy',
    refund: 'Non-refundable',
    action: 'Book Now',
    seatsLeft: 3,
    stop: 'Non Stop(s)',
  },
  {
    logo: '',
    airline: 'AirAsia',
    flightNumber: 'I5-1234',
    departTime: '11:00',
    departDate: '28 Jun',
    departCity: 'DEL',
    duration: '2 h 45 m',
    arriveTime: '13:45',
    arriveDate: '28 Jun',
    arriveCity: 'BOM',
    price: 15499,
    tag: 'Saver',
    classType: 'Economy',
    refund: 'Non-refundable',
    action: 'BOOK',
    seatsLeft: 8,
    stop: 'Non Stop(s)',
  },
  {
    logo: '',
    airline: 'SpiceJet',
    flightNumber: 'SG-456',
    departTime: '18:10',
    departDate: '28 Jun',
    departCity: 'DEL',
    duration: '2 h 25 m',
    arriveTime: '20:35',
    arriveDate: '28 Jun',
    arriveCity: 'BOM',
    price: 17299,
    tag: 'Hot Meals',
    classType: 'Premium Economy',
    refund: 'Refundable',
    action: 'BOOK',
    seatsLeft: 4,
    stop: 'Non Stop(s)',
  },
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
