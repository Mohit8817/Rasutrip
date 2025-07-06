import axios from 'axios';
import baseURL from '../../Services/Config';

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


