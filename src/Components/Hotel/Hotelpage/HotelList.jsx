// src/Components/Hotel/HotelList.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import HotelCard from "./HotelCard";
import { fetchHotels, fetchHotelCities } from "../../APIS/HotelApi/HotelAPi";
import "./HotelListingPage.css";

const HotelList = () => {
  const location = useLocation();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchToken, setSearchToken] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 20000]);

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
    if (isNaN(date)) return "";
    return date.toISOString().split("T")[0];
  };

  useEffect(() => {
    const loadHotels = async () => {
      setLoading(true);

      try {
        const cleanedCity = city?.split(",")[0]?.trim();
        const cityList = await fetchHotelCities(cleanedCity);
        console.log("🏙️ Hotel Cities Response:", cityList);

        const selectedCity = cityList.find(
          (item) =>
            item.destination &&
            cleanedCity.toLowerCase() === item.destination.toLowerCase()
        );

        if (!selectedCity) {
          console.warn(`❌ No city found for: ${cleanedCity}`);
          setHotels([]);
          setLoading(false);
          return;
        }

        const destinationCityId = selectedCity.city_id;
        const formattedCheckIn = formatDate(checkIn);
        const formattedCheckOut = formatDate(checkOut);
        const nights = getNights(checkIn, checkOut);

        const payload = {
          CheckInDate: formattedCheckIn,
          CheckOutDate: formattedCheckOut,
          NoOfNights: nights,
          CountryCode: "IN",
          DestinationCityId: destinationCityId,
          ResultCount: 20,
          GuestNationality: "IN",
          NoOfRooms: rooms,
          RoomGuests: [
            {
              Adult: guests,
              Child: 0,
              ChildAge: [],
            },
          ],
          MaxRating: 5,
          MinRating: 1,
          UserIp: "49.36.217.215",
        };

        console.log("📦 Sending Payload to API:", payload);
        const hotelResponse = await fetchHotels(payload);
        console.log("✅ Hotel API Response:", hotelResponse);

        const { SearchTokenId, Result, Error } = hotelResponse || {};

        if (Error?.ErrorCode !== 0) {
          console.warn("❌ Hotel API Error:", Error?.ErrorMessage);
          setHotels([]);
          setLoading(false);
          return;
        }

        // ✅ Attach SearchTokenId to each hotel item
        const formattedHotels = (Result || []).map((item) => ({
          id: item.HotelCode,
          name: item.HotelName,
          location: item.HotelAddress,
          rating: item.StarRating,
          price: item.Price?.PublishedPrice || 0,
          tax: item.Price?.Tax || 0,
          discount: item.Price?.Discount || 0,
          image: item.HotelPicture,
          description: item.HotelDescription || "No description available.",
          promotion: item.HotelPromotion || "",
          latitude: item.Latitude,
          longitude: item.Longitude,
          resultIndex: item.ResultIndex,
          supplier: item.Supplier,
          source: item.Source,
          isHotDeal: item.IsHotDeal,
          SearchTokenId: SearchTokenId, // ✅ Injected for later use

          //          // ✅ Add these:
          // checkInDate: formattedCheckIn,
          // checkOutDate: formattedCheckOut,
          // nights: nights,
          // rooms: rooms,
          // guests: guests
        }));

        if (formattedHotels.length === 0) {
          console.warn("⚠️ No hotels returned.");
        }

        const prices = formattedHotels.map((h) => h.price);
        setPriceRange([Math.min(...prices), Math.max(...prices)]);

        setSearchToken(SearchTokenId || null);
        setHotels(formattedHotels);
      } catch (err) {
        console.error("❌ Error loading hotels:", err);
        setHotels([]);
      }

      setLoading(false);
    };

    if (checkIn && checkOut && city) {
      loadHotels();
    } else {
      console.warn("❗ Missing required hotel search fields", {
        city,
        checkIn,
        checkOut,
      });
      setLoading(false);
    }
  }, [city, checkIn, checkOut, guests, rooms]);

  if (loading) return <div className="text-center p-5">Loading hotels...</div>;
  if (hotels.length === 0) return <div className="text-center p-5">No hotels found.</div>;

  return (
    <div className="hotel-list">
      <div className="text-end p-2 text-muted" style={{ fontSize: "12px" }}>
        Token: {searchToken || "N/A"}
      </div>
      {hotels.map((hotel, index) => (
        <HotelCard key={index} hotel={hotel} />
      ))}
    </div>
  );
};

export default HotelList;
