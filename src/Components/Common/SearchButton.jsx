// src/Components/Common/SearchButton.jsx
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LocationContext } from '../Context/LocationContext';
import { HotelSearchContext } from '../Context/HotelSearchContext';
import '../../Style/FlightBooking.css';

const SearchButton = ({ type }) => {
  const navigate = useNavigate();
  const { locationData } = useContext(LocationContext);
  const { hotelSearchData } = useContext(HotelSearchContext);

  localStorage.removeItem('SearchedFlights');
  localStorage.removeItem('selectedOnwardFlight');
  localStorage.removeItem('selectedReturnFlight');


  const handleSearchClick = () => {
    const {
      fromCity,
      toCity,
      fromAirport,
      toAirport,
      fromCode,
      toCode,
      departDate,
      returnDate,
      passengers,
      cabinClass,
      tripType,
      fromCityId,
      toCityId,
      totalPrice,
    } = locationData;

    console.log('locationData',locationData)

    switch (type) {
      case 'flight':
        navigate('/flight-results', {
          state: {
            fromCity,
            toCity,
            fromAirport,
            toAirport,
            fromCode,
            toCode,
            departDate: departDate || { PreferredTime: new Date().toISOString() },
            returnDate: returnDate || null,
            passengers,
            cabinClass,
            tripType: tripType || 'oneway'
          }
        });
        break;

      case 'bus':
        navigate('/bus-results', {
          state: {
            fromCity,
            toCity,
            fromCityId,
            toCityId,
            departDate: departDate || new Date().toISOString(),
            totalPrice
          }
        });
        break;

        case 'hotel': {
          const {
            city,
            checkIn,
            checkOut,
            guests,
            rooms,
            nights,
          } = hotelSearchData || {};

          if (city && checkIn && checkOut) {
            const roomDetails = Array.from({ length: Number(rooms) }, () => ({
              Adult: 1,
              Child: 0,
              ChildAge: []
            }));

            navigate('/hotel-results', {
              state: {
                city: city.trim(),
                checkIn,
                checkOut,
                guests: Number(guests),
                rooms: Number(rooms),
                nights: Number(nights),
                roomDetails,
                minRating: 4,
                maxRating: 5,
                resultCount: null
              }
            });
          } else {
            console.warn('❌ Missing hotel search parameters:', hotelSearchData);
            alert("Please fill in city, check-in, and check-out dates for hotel search.");
          }
          break;
        }


        default:
          console.warn('Unknown search type:', type);
      }
    };

  return (
    <div>
      <button className="Mybutton" onClick={handleSearchClick}>
        Search
      </button>
    </div>
  );
};

export default SearchButton;
