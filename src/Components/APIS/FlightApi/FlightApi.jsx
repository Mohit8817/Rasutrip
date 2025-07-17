import axios from 'axios';
import baseURL from '../../../Services/Config';

export const Services = {
  fetchLocation: `${baseURL}/airport/search-airport`,
  fetchFlights: `${baseURL}/airservice/search`,
  fetchFareRulesUrl: `https://www.stagingapi.bdsd.technology/api/airservice/rest/farerule`,
  FareConfirmation: `${baseURL}/airservice/fare-confirmation`,
  fetchssr: `${baseURL}/airservice/ssr`
};

const headers = {
  userName: 'TTS',
  password: 'TTS@001'
};

// Location Search API
export const fetchLocationData = async (query) => {
  const response = await axios.get(`${Services.fetchLocation}?name=${query}`, { headers });
  return response.data;
};

// flightApis.js
export const fetchFlightData = async (payload) => {
  const response = await axios.post(Services.fetchFlights, payload, { headers });
  console.log('response',response)
  return response.data; // ✅ return full data
};


export const fetchFareRules = async (payload) => {
  const response = await axios.post(Services?.fetchFareRulesUrl, payload, { headers });
  return response.data;
}

export const fetchFareConfirmation = async (payload) => {
  const response = await axios.post(Services?.FareConfirmation, payload, { headers })
  return response.data
}

export const fetchSSR = async (payload) => {
  const response = await axios.post(Services?.fetchssr, payload, { headers })
  return response.data
}

export const post = async (data, url, customHeaders = {}) => {
  try {
    // const token = localStorage.getItem("token");
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODA3NmE0OThhYmQzYmExZDNjMDY0NTUiLCJ1c2VyUmVnSWQiOiJSVFJJUDAwMTIiLCJlbWFpbCI6ImlzaGl0YS5vdHVzb25lQGdtYWlsLmNvbSIsImlhdCI6MTc1MjAzMzcxMCwiZXhwIjoxNzUzMzI5NzEwfQ.AWZZOOXwch5GSLkUx-f7Ke7bWP3ULHhOvFWN25w96rQ'
    const headers = {
      Authorization: `Bearer ${token}`,
      ...customHeaders, // allow additional headers
    };
    const response = await axios.post(baseURL + url, data, { headers });
    console.log('hit api');
    return response.data;
  } catch (error) {
    console.error('POST request failed:', error);
    throw error;
  }
};


