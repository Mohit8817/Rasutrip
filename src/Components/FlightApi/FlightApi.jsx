  import axios from 'axios';
  import baseURL from '../../Services/Config';

  export const Services = {
    fetchLocation: `${baseURL}/airport/search-airport`,

    fetchFlights: `${baseURL}/airservice/search`,
  };

  // Location Search API
  export const fetchLocationData = async (query) => {
    const response = await axios.get(`${Services.fetchLocation}?name=${query}`);
    return response.data;
  };

// flightApis.js
export const fetchFlightData = async (payload) => {
  const response = await axios.post(Services.fetchFlights, payload);
  return response.data; // ✅ return full data
};



