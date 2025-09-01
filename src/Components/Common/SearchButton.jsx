// src/Components/Common/SearchButton.jsx
import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LocationContext } from '../Context/LocationContext';
import { HotelSearchContext } from '../Context/HotelSearchContext';
import '../../Style/FlightBooking.css';

const SearchButton = ({ type, }) => {
  const navigate = useNavigate();
  const location = useLocation();
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
      directflight,
      toCityId,
      totalPrice,
    } = locationData;
    switch (type) {
      case 'flight': {
        const searchParams = new URLSearchParams();

    console.log('locationDatakkkkk', locationData)


        let state = {};
        if (locationData.tripType === 'multicity' && locationData.AirSegments) {
          state = {
            AirSegments: locationData.AirSegments,
            passengers: locationData.passengers,
            cabinClass: locationData.cabinClass,
            directflight,
            tripType: 'multicity'
          };
        } else {
          state = {
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
            directflight,
            tripType: tripType || 'oneway'
          };
        }

        // Helper function to handle navigation
        const goToResults = () => {
          navigate('/flight-results', { state });
        };

        if (location.pathname === '/flight-results') {
          navigate(`/?${searchParams.toString()}`, { replace: true });
          setTimeout(goToResults, 10);
        } else {
          goToResults();
        }

        break;
      }
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
          country, // ✅ Get country name
          countryCode, // ✅ Get country code
          roomDetails = []
        } = hotelSearchData || {};

        console.log('🔍 Hotel Search Data:', hotelSearchData);
        console.log('🏨 Room Details from Context:', roomDetails);
        console.log('🌍 Selected Country:', country, 'Code:', countryCode);

        if (city && checkIn && checkOut) {
          const apiRoomDetails = roomDetails.map(room => ({
            Adult: room.adults,
            Child: room.children,
            ChildAge: Array(room.children).fill(5)
          }));

          console.log('🚀 Sending to API:', apiRoomDetails);

          navigate('/hotel-results', {
            state: {
              city: city.trim(),
              checkIn,
              checkOut,
              guests: Number(guests),
              rooms: Number(rooms),
              nights: Number(nights),
              country: country, // ✅ Pass country name
              countryCode: countryCode, // ✅ Pass country code
              roomDetails: apiRoomDetails,
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