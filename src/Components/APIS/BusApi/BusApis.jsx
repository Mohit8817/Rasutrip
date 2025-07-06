import axios from 'axios';
import baseURL from '../../../Services/Config';

// API Endpoint
export const BusServices = {
    fetchCities: `${baseURL}/bus/search-city`
};

// Function to fetch cities dynamically
export const fetchBusCities = async (cityName) => {
    const response = await axios.get(`${BusServices.fetchCities}?city_name=${cityName}`);
    return response.data;
};
