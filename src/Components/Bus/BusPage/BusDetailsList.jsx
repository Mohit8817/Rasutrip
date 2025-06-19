import React from 'react';
import { Container } from 'react-bootstrap';
import BusDetailsCard from './BusDetailsCard';
import "../../../Style/Pagescss/BusResultPage.css";

const busData = [
  {
    operator: "Avm Tours And Travels",
    busType: "Non A/c Seater / Sleeper (2+1)",
    departTime: "21:15",
    departDate: "20-Jun",
    departLocation: "Delhi",
    duration: "10h 35m",
    arriveTime: "07:50",
    arriveDate: "21-Jun",
    arriveLocation: "Lucknow",
    price: "₹ 577.50",
    seatsAvailable: 32
  },
  {
    operator: "Bmcc Travels",
    busType: "Non Ac Seater / Sleeper 2+1",
    departTime: "20:30",
    departDate: "20-Jun",
    departLocation: "Delhi",
    duration: "9h 00m",
    arriveTime: "05:30",
    arriveDate: "21-Jun",
    arriveLocation: "Lucknow",
    price: "₹ 681.45",
    seatsAvailable: 29
  },
  {
    operator: "N S Holidays",
    busType: "Non A/c Sleeper (2+1)",
    departTime: "22:45",
    departDate: "20-Jun",
    departLocation: "Delhi",
    duration: "9h 20m",
    arriveTime: "08:05",
    arriveDate: "21-Jun",
    arriveLocation: "Lucknow",
    price: "₹ 892.50",
    seatsAvailable: 23
  },
  {
    operator: "Jabbar Travels",
    busType: "Volvo A/c Bl Ir Multi Axle Semi Sleeper (2+2)",
    departTime: "22:30",
    departDate: "20-Jun",
    departLocation: "Delhi",
    duration: "9h 00m",
    arriveTime: "07:30",
    arriveDate: "21-Jun",
    arriveLocation: "Lucknow",
    price: "₹ 906.15",
    seatsAvailable: 34
  },
  {
    operator: "Intrcity Smartbus",
    busType: "A/c Seater / Sleeper (2+1)",
    departTime: "21:00",
    departDate: "20-Jun",
    departLocation: "Delhi",
    duration: "9h 50m",
    arriveTime: "07:15",
    arriveDate: "21-Jun",
    arriveLocation: "Lucknow",
    price: "₹ 933.00",
    seatsAvailable: 27
  },
  {
    operator: "Raja Express",
    busType: "Ve A/c Sleeper (2+1)",
    departTime: "21:00",
    departDate: "20-Jun",
    departLocation: "Delhi",
    duration: "9h 20m",
    arriveTime: "07:05",
    arriveDate: "21-Jun",
    arriveLocation: "Lucknow",
    price: "₹ 934.50",
    seatsAvailable: 9
  }
];

const BusDetailsList = () => {
    return (
        <Container className="bus-list-container">
            <div className="sort-header d-flex p-2 mb-2">
                <div className="flex-fill text-center">Sort By:</div>
                <div className="flex-fill text-center fw-bold">Depart</div>
                <div className="flex-fill text-center fw-bold">Duration</div>
                <div className="flex-fill text-center fw-bold">Arrive</div>
                <div className="flex-fill text-center fw-bold">Price</div>
            </div>

            {busData.map((bus, index) => (
                <BusDetailsCard key={index} bus={bus} />
            ))}
        </Container>
    );
};

export default BusDetailsList;
