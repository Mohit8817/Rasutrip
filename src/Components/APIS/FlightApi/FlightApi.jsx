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
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...customHeaders, // allow additional headers
    };

    const response = await fetch(baseURL + url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
    });

    // Check if the response is successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse and return the response data
    const responseData = await response.json();
    return responseData;
    
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





