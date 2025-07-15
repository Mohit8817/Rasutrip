import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import HotelCard from "./HotelCard";
import { fetchHotels, fetchHotelCities } from "../../APIS/HotelApi/HotelAPi";
import HotelLoader from "../HotelLoaderCard/HotelLoader";

const HotelList = ({
  priceRange,
  selectedRatings,
  searchName,
  setActualPriceRange,
  setHotelNames,
}) => {
  const location = useLocation();
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  const state = location?.state || {};
  const city = state.city || "";
  const checkIn = state.checkIn || "";
  const checkOut = state.checkOut || "";
  const guests = Number(state.guests || 1);
  const rooms = Number(state.rooms || 1);

  const getNights = (checkInDate, checkOutDate) => {
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = end - start;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return isNaN(date) ? "" : date.toISOString().split("T")[0];
  };

  useEffect(() => {
    const loadHotels = async () => {
      setLoading(true);
      try {
        const cleanedCity = city?.split(",")[0]?.trim();
        const cityList = await fetchHotelCities(cleanedCity);

        const selectedCity = cityList.find(
          (item) =>
            item.destination &&
            cleanedCity.toLowerCase() === item.destination.toLowerCase()
        );

        if (!selectedCity) {
          setHotels([]);
          setLoading(false);
          return;
        }

        const payload = {
          CheckInDate: formatDate(checkIn),
          CheckOutDate: formatDate(checkOut),
          NoOfNights: getNights(checkIn, checkOut),
          CountryCode: "IN",
          DestinationCityId: selectedCity.city_id,
          ResultCount: 20,
          GuestNationality: "IN",
          NoOfRooms: rooms,
          RoomGuests: [{ Adult: guests, Child: 0, ChildAge: [] }],
          MaxRating: 5,
          MinRating: 1,
          UserIp: "49.36.217.215",
        };

        const hotelResponse = await fetchHotels(payload);
        const { SearchTokenId, Result = [] } = hotelResponse || {};

        const formattedHotels = Result.map((item) => ({
          id: item.HotelCode,
          name: item.HotelName,
          location: item.HotelAddress,
          rating: item.StarRating,
          price: item.Price?.PublishedPrice || 0,
          tax: item.Price?.Tax || 0,
          image: item.HotelPicture,
          description: item.HotelDescription || "",
          resultIndex: item.ResultIndex,
          SearchTokenId,
        }));

        const prices = formattedHotels.map((h) => h.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        setHotels(formattedHotels);
        setActualPriceRange([minPrice, maxPrice]);

        // ✅ Set hotel names for search dropdown
        setHotelNames(formattedHotels.map((h) => h.name));
      } catch (err) {
        console.error("Error loading hotels:", err);
        setHotels([]);
      }

      setLoading(false);
    };

    if (checkIn && checkOut && city) {
      loadHotels();
    } else {
      setLoading(false);
    }
  }, [city, checkIn, checkOut, guests, rooms, setActualPriceRange, setHotelNames]);

  useEffect(() => {
    const filtered = hotels.filter((hotel) => {
      const inPriceRange =
        hotel.price >= priceRange[0] && hotel.price <= priceRange[1];

      const inRatingRange =
        selectedRatings.length === 0 ||
        selectedRatings.includes(Math.round(hotel.rating));

      const matchesName =
        !searchName ||
        hotel.name.toLowerCase().includes(searchName.toLowerCase());

      return inPriceRange && inRatingRange && matchesName;
    });

    setFilteredHotels(filtered);
  }, [priceRange, selectedRatings, searchName, hotels]);

  if (loading) return <HotelLoader />;

  if (filteredHotels.length === 0)
    return <div className="text-center p-5">No hotels found in selected range.</div>;

  return (
    <div className="hotel-list">
      {filteredHotels.map((hotel, index) => (
        <HotelCard key={index} hotel={hotel} />
      ))}
    </div>
  );
};

export default HotelList;
