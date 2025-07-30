// src/APIS/BusApi/BusApis.js
import axios from "axios";
import baseURL from "../../../Services/Config";


const BusServices = {
  fetchCities: `${baseURL}/bus/search-city`,
  searchResults: `${baseURL}/busservice/search`,
  seatLayout: `${baseURL}/busservice/seatlayout`,
  boardingDroppingPoints: `${baseURL}/busservice/boardingpoint`,
  blockSeat: `${baseURL}/busservice/blockseat`, // ✅ Added Block Seat API
  createOrder: `${baseURL}/busservice/create-order`,

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

// ─────────────────────────────────────────────────────────────
// 🚌 Fetch Boarding / Dropping points (FIXED)
// ─────────────────────────────────────────────────────────────
export const fetchBoardingDroppingPoints = async ({
  UserIp,
  SearchTokenId,
  ResultIndex,
  OriginId,
  DestinationId,
}) => {
  try {
    // Use only the 3 required parameters as per your Postman example
    const payload = {
      UserIp,
      SearchTokenId,
      ResultIndex,
    };

    console.log("🔍 Sending Boarding/Dropping API Payload:", payload);

    const response = await axios.post(BusServices.boardingDroppingPoints, payload);

    console.log("✅ Boarding/Dropping Response:", response.data);

    // Return the data structure that matches your API response
    return {
      BoardingPointsDetails: response.data?.data?.BoardingPointsDetails || [],
      DroppingPointsDetails: response.data?.data?.DroppingPointsDetails || [],
    };
  } catch (error) {
    console.error("❌ Failed to fetch boarding/dropping points:", error.response?.data || error.message);

    // Return empty arrays on error
    return {
      BoardingPointsDetails: [],
      DroppingPointsDetails: [],
    };
  }
};

// ─────────────────────────────────────────────────────────────
// 🔒 Block Seat API - Temporarily lock selected seats
// ─────────────────────────────────────────────────────────────
export const blockSeats = async ({
  UserIp,
  SearchTokenId,
  ResultIndex,
  BoardingPointId,
  DroppingPointId,
  OriginId,
  DestinationId,
  Passenger // Array of passenger objects with seat information
}) => {
  try {
    const payload = {
      UserIp,
      SearchTokenId,
      ResultIndex,
      BoardingPointId,
      DroppingPointId,
      OriginId,
      DestinationId,
      Passenger
    };

    console.log("🔒 Blocking seats with payload:", payload);

    const response = await axios.post(BusServices.blockSeat, payload);

    console.log("✅ Block Seat API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to block seats:", error.response?.data || error.message);
    throw error;
  }
};









// ─────────────────────────────────────────────────────────────
// 💳 Create Bus Payment Order
// ─────────────────────────────────────────────────────────────
export const createBusPaymentOrder = async (orderData) => {
  try {
    const response = await axios.post(BusServices.createOrder, orderData);
    return response.data;
  } catch (err) {
    console.error("❌ Error creating bus payment order:", err);
    throw err.response?.data || { message: "Failed to create payment order" };
  }
};


export const formatBusOrderData = (data) => {
  return {
    transactionId: data.transactionId,
    seats: data.seats,
    amount: data.amount,
    user: {
      name: data.name,
      email: data.email,
      phone: data.phone,
    },
    // Add more fields as needed
  };
};
