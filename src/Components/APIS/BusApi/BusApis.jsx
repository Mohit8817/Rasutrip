// src/APIS/BusApi/BusApis.js
import axios from "axios";
import baseURL from "../../../Services/Config";

const BusServices = {
    fetchCities: `${baseURL}/bus/search-city`,
    searchResults: `${baseURL}/busservice/search`,
    seatLayout: `${baseURL}/busservice/seatlayout`,
};

// ─────────────────────────────────────────────────────────────
// 📍 Fetch cities for autocomplete/search
// ─────────────────────────────────────────────────────────────
export const fetchBusCities = async (cityName) => {
    try {
        const response = await axios.get(`${BusServices.fetchCities}?city_name=${cityName}`);
        return response.data;
    } catch (err) {
        console.error("❌ Error fetching bus cities:", err);
        return [];
    }
};

// ─────────────────────────────────────────────────────────────
// 🚌 Fetch bus search results
// ─────────────────────────────────────────────────────────────
export const fetchBusResults = async (DateOfJourney, OriginId, DestinationId, UserIp) => {
    try {
        const response = await axios.post(BusServices.searchResults, {
            DateOfJourney,
            OriginId,
            DestinationId,
            UserIp,
        });

        return response.data;
    } catch (err) {
        console.error("❌ Failed to fetch bus results:", err);
        return [];
    }
};

// ─────────────────────────────────────────────────────────────
// 💺 Fetch bus seat layout for a selected bus
// ─────────────────────────────────────────────────────────────
export const fetchSeatLayout = async ({
    SearchTokenId,
    ResultIndex,
    UserIp,
    OriginId,
    DestinationId,
}) => {
    try {
        console.log("📡 Calling Seat Layout API with:", {
            SearchTokenId,
            ResultIndex,
            UserIp,
            OriginId,
            DestinationId,
        });

        const response = await axios.post(BusServices.seatLayout, {
            SearchTokenId,
            ResultIndex,
            UserIp,
            OriginId,
            DestinationId,
        });

        console.log("✅ Seat Layout API Response:", response.data);
        return response.data;
    } catch (err) {
        console.error("❌ Seat layout fetch error:", err);
        throw err;
    }
};
