// /FlightBooking/api/flightApis.js
import axios from 'axios';
import baseURL from '../../Services/Config';

export const Services = {
  fetchLocation: `${baseURL}/airport/search-airport`,

  // availableDates: `${baseURL}/calendar/dates`,

  // loginUrl: `${baseURL}/login`,
  // signupUrl: `${baseURL}/registeration`,
  // verifyOtpUrl: `${baseURL}/verify-otp`,
  // setOtpUrl: `${baseURL}/send-otp`,
};

// ✅ Location Search API
export const fetchLocationData = async (query) => {
  const response = await axios.get(`${Services.fetchLocation}?name=${query}`);
  return response.data;
};
