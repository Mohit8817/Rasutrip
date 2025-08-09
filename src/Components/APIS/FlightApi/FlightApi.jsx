import axios from 'axios';
import baseURL from '../../../Services/Config';

export const Services = {
  fetchLocation: `${baseURL}/airport/search-airport`,
  fetchFlights: `${baseURL}/airservice/search`,
  fetchFareRulesUrl: `https://www.stagingapi.bdsd.technology/api/airservice/rest/farerule`,
  // fetchFareRulesUrl: `${baseURL}/airservice/rest/farerule`,
  FareConfirmation: `${baseURL}/airservice/fare-confirmation`,
  fetchssr: `${baseURL}/airservice/ssr`
};

const token = localStorage.getItem('token')

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
  console.log('response', response)
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
    const headers = {
      Authorization: `Bearer ${token}`,
      ...customHeaders, // allow additional headers
    };
    const response = await axios.post(baseURL + url, data, { headers });
    return response.data;
  } catch (error) {
    console.error('POST request failed:', error);
    throw error;
  }
};

export const getUserIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return '27.60.0.238'
    // return data.ip;
    //  // This will be something like "122.161.64.143"
  } catch (error) {
    console.error('Failed to get IP:', error);
    return '';
  }
};



