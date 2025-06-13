import React from 'react';
import RoundTripCard from './RoundTripCard';

const flightData = [
    {
        airline: 'Air India',
        logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/12/Air_India_Logo.svg/1200px-Air_India_Logo.svg.png',
        flightNumber: 'AI-441',
        departCode: 'DEL',
        departTime: '17:15',
        departDate: '14 Jun',
        duration: '2 h 50 m',
        arriveCode: 'BOM',
        arriveTime: '20:05',
        arriveDate: '14 Jun',
        seatsLeft: 9,
        fareOptions: [
            { price: 8134, label: 'Eco Value', refundable: true },
            { price: 8191, label: 'SME', refundable: true },
            { price: 8664, label: 'Eco Classic', refundable: true },
        ],
    },
    {
        airline: 'Spicejet',
        logo: 'https://1000logos.net/wp-content/uploads/2021/06/SpiceJet-logo.png',
        flightNumber: 'SG-710',
        departCode: 'BOM',
        departTime: '23:00',
        departDate: '15 Jun',
        duration: '1 h 55 m',
        arriveCode: 'DEL',
        arriveTime: '00:55',
        arriveDate: '16 Jun',
        seatsLeft: 1,
        fareOptions: [
            { price: 4784, label: 'OFFER_FARE_WITH_PNR', refundable: false },
            { price: 5988, label: 'COUPON', refundable: true },
            { price: 6163, label: 'CORPORATE_FARE', refundable: true },
        ],
    }
];

const RoundTripCardList = () => {
    return (
        <div className="px-4">
            {flightData.map((flight, index) => (
                <RoundTripCard key={index} flight={flight} />
            ))}
        </div>
    );
};

export default RoundTripCardList;
