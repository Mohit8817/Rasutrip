// BusApis.js
import axios from 'axios';
import baseURL from '../../../Services/Config';

const BusServices = {
    fetchCities: `${baseURL}/bus/search-city`,
    searchResults: `${baseURL}/busservice/search`,
};

export const fetchBusCities = async (cityName) => {
    const response = await axios.get(`${BusServices.fetchCities}?city_name=${cityName}`);
    return response.data;
};


export const fetchBusResults = async (DateOfJourney, OriginId, DestinationId, UserIp) => {
    try {
        const res = await axios.post(`${baseURL}/busservice/search`, {
            // from_city: from,
            // to_city: to,
            // travel_date: date,
            DateOfJourney,
            OriginId,
            DestinationId,
            UserIp

        });
        return res.data;
    } catch (err) {
        console.error("Failed to fetch bus results", err);
        return [];
    }
};

