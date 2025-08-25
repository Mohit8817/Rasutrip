import React, { useState, useEffect, useRef, useMemo, useContext } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { FaPlane } from 'react-icons/fa'; // Plane icon
import '../../../Style/FlightBooking.css'; // Add your custom styles
import { fetchLocationData } from '../../APIS/FlightApi/FlightApi';
import { LocationContext } from '../../Context/LocationContext';

const cityList = [
    { city: 'Delhi', airport: 'Delhi Indira Gandhi Intl', code: 'DEL', flag: '🇮🇳' },
    { city: 'Mumbai', airport: 'Chhatrapati Shivaji', code: 'BOM', flag: '🇮🇳' },
    { city: 'Dubai', airport: 'Delhi Indira Gandhi Intl', code: 'DXB', flag: '🇮🇳' },
    { city: 'Kolkata', airport: 'Netaji Subhas Chandra Bose Intl', code: 'CCU', flag: '🇮🇳' },
    { city: 'Bengaluru', airport: 'Bengaluru Intl Arpt', code: 'BLR', flag: '🇮🇳' },
    { city: 'Chennai', airport: 'Chennai Arpt', code: 'MAA', flag: '🇮🇳' },
    { city: 'Goa In', airport: 'Dabolim Arpt', code: 'GOI', flag: '🇮🇳' },
];

const CitySegment = ({ onToCityChange, onSelect, id }) => {
    const { locationData, setLocationData } = useContext(LocationContext);

    const [showFromDropdown, setShowFromDropdown] = useState(false);
    const [showToDropdown, setShowToDropdown] = useState(false);
    const [fromCityList, setFromCityList] = useState([]);
    const [toCityList, setToCityList] = useState([]);
    const [fromLoading, setFromLoading] = useState(false);
    const [toLoading, setToLoading] = useState(false);
    const [fromAirportData, setFromAirportData] = useState(null);
    const [toAirportData, setToAirportData] = useState(null);
    
    // Local input values - separate from locationData
    const [fromInputValue, setFromInputValue] = useState(locationData.fromCity || 'Delhi');
    const [toInputValue, setToInputValue] = useState(locationData.toCity || 'Mumbai');
    
    // Local airport data for display
    const [fromAirportInfo, setFromAirportInfo] = useState({ 
        code: 'DEL', 
        name: 'Delhi Indira Gandhi Intl' 
    });
    const [toAirportInfo, setToAirportInfo] = useState({ 
        code: 'BOM', 
        name: 'Chhatrapati Shivaji' 
    });
    
    // Separate query states for FROM and TO fields
    const [fromQuery, setFromQuery] = useState('');
    const [toQuery, setToQuery] = useState('');

    const [fromCity, setFromCity] = useState('Delhi');
    const [toCity, setToCity] = useState('Mumbai');
    const [fromCityData, setFromCityData] = useState({});
    const [toCityData, setToCityData] = useState({});
    const [fromAirport, setFromAirport] = useState('Delhi Indira Gandhi Intl');
    const [toAirport, setToAirport] = useState('Chhatrapati Shivaji');

    const fromRef = useRef(null);
    const toRef = useRef(null);

    // Separate fetch functions for FROM and TO
    const fetchFromAirports = async (query) => {
        try {
            setFromLoading(true);
            const response = await fetchLocationData(query);
            setFromCityList(response?.results || []);
        } catch (error) {
            console.error('Error fetching FROM airport data:', error);
            setFromCityList([]);
        } finally {
            setFromLoading(false);
        }
    };

    const fetchToAirports = async (query) => {
        try {
            setToLoading(true);
            const response = await fetchLocationData(query);
            setToCityList(response?.results || []);
        } catch (error) {
            console.error('Error fetching TO airport data:', error);
            setToCityList([]);
        } finally {
            setToLoading(false);
        }
    };

    // Debounced fetch for FROM query
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (fromQuery.trim().length >= 2) {
                fetchFromAirports(fromQuery);
            } else {
                setFromCityList([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [fromQuery]);

    // Debounced fetch for TO query
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (toQuery.trim().length >= 2) {
                fetchToAirports(toQuery);
            } else {
                setToCityList([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [toQuery]);

    useEffect(() => {
        const fetchDefaultAirports = async () => {
            try {
                const fromRes = await fetchLocationData('delhi');
                if (fromRes?.results?.length) {
                    const airport = fromRes.results[0];
                    setFromAirportData(airport);
                    setLocationData((prev) => ({
                        ...prev,
                        fromAirport: airport.name,
                        fromCode: airport.code,
                    }));
                }

                const toRes = await fetchLocationData(locationData.toCity);
                if (toRes?.results?.length) {
                    const airport = toRes.results[0];
                    setToAirportData(airport);
                    setLocationData((prev) => ({
                        ...prev,
                        toAirport: airport.name,
                        toCode: airport.code,
                    }));
                }
            } catch (error) {
                console.error('Error fetching default airport data:', error);
            }
        };

        fetchDefaultAirports();
    }, [locationData.fromCity, locationData.toCity, setLocationData]);

    const handleFromInputClick = () => {
        setShowFromDropdown(true);
        setShowToDropdown(false);
        setFromQuery(fromInputValue);
    };

    const handleToInputClick = () => {
        setShowToDropdown(true);
        setShowFromDropdown(false);
        setToQuery(toInputValue);
    };

    const handleCitySelect = (cityObj, type) => {
        console.log('cityObj', cityObj);
        if (type === 'from') {
            setFromInputValue(cityObj.city_name || cityObj.city);
            setFromCity(cityObj.city);
            setFromCityData(cityObj.city);
            onSelect({ cityObj, type });
            setFromAirport(cityObj.airport);
            setShowFromDropdown(false);
            setFromCityList([]);
            
            // Update local airport info for FROM
            setFromAirportInfo({
                code: cityObj.code,
                name: cityObj.name
            });
            
            // Update locationData for FROM
            setLocationData((prev) => ({
                ...prev,
                fromCity: cityObj.city_name || cityObj.city,
                fromAirport: cityObj.name,
                fromCode: cityObj.code,
            }));
        } else {
            setToInputValue(cityObj.city_name || cityObj.city);
            setToCity(cityObj.city);
            setToCityData(cityObj.code);
            onSelect({ cityObj, type });
            setToAirport(cityObj.airport);
            setShowToDropdown(false);
            setToCityList([]);

            // Update local airport info for TO
            setToAirportInfo({
                code: cityObj.code,
                name: cityObj.name
            });

            // Update locationData for TO
            setLocationData((prev) => ({
                ...prev,
                toCity: cityObj.city_name || cityObj.city,
                toAirport: cityObj.name,
                toCode: cityObj.code,
            }));

            if (onToCityChange) {
                onToCityChange(cityObj.city);
            }
        }
    };

    // Click outside close logic
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                fromRef.current &&
                !fromRef.current.contains(event.target) &&
                toRef.current &&
                !toRef.current.contains(event.target)
            ) {
                setShowFromDropdown(false);
                setShowToDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Separate input change handlers
    const handleFromInputChange = (e) => {
        const value = e.target.value;
        setFromInputValue(value); // Update local input value
        setFromQuery(value); // Update query for search
        
        // Clear airport info when typing
        setFromAirportInfo({ code: '---', name: '' });
        setLocationData((prev) => ({
            ...prev,
            fromAirport: '',
            fromCode: ''
        }));
    };

    const handleToInputChange = (e) => {
        const value = e.target.value;
        setToInputValue(value); // Update local input value
        setToQuery(value); // Update query for search
        
        // Clear airport info when typing
        setToAirportInfo({ code: '---', name: '' });
        setLocationData((prev) => ({
            ...prev,
            toAirport: '',
            toCode: ''
        }));
    };

    return (
        <div>
            <Card className="location-card position-relative">
                <Row className="g-0 align-items-center">
                    {/* FROM */}
                    <Col xs={6} className="location-box position-relative" ref={fromRef}>
                        <span className="location-label">From Airport</span>
                        <input
                            type="text"
                            className="location-city form-control border-0 p-0"
                            value={fromInputValue}
                            onClick={handleFromInputClick}
                            onChange={handleFromInputChange}
                        />
                        <div className="location-airport">
                            [{fromAirportInfo.code}] {fromAirportInfo.name}
                        </div>

                        {showFromDropdown && (
                            <div className="dropdown-list">
                                {fromLoading ? (
                                    <div className="dropdown-item text-muted">Loading...</div>
                                ) : fromCityList.length === 0 ? (
                                    <div className="dropdown-item text-muted">No results found.</div>
                                ) : (
                                    fromCityList.map((cityObj, index) => (
                                        <div
                                            key={index}
                                            className="dropdown-item"
                                            onClick={() => handleCitySelect(cityObj, 'from')}
                                        >
                                            <FaPlane className="me-2" />
                                            <strong>{cityObj.city_name}</strong> &nbsp;
                                            <span>({cityObj.name})</span> &nbsp;
                                            <span className="ms-auto">[{cityObj.code}]</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </Col>

                    {/* TO */}
                    <Col xs={6} className="location-box position-relative" ref={toRef}>
                        <span className="location-label">TO Airport</span>
                        <input
                            type="text"
                            className="location-city form-control border-0 p-0"
                            value={toInputValue}
                            onClick={handleToInputClick}
                            onChange={handleToInputChange}
                        />
                        <div className="location-airport">
                            [{toAirportInfo.code}] {toAirportInfo.name}
                        </div>

                        {showToDropdown && (
                            <div className="dropdown-list">
                                {toLoading ? (
                                    <div className="dropdown-item text-muted">Loading...</div>
                                ) : toCityList.length === 0 ? (
                                    <div className="dropdown-item text-muted">No results found.</div>
                                ) : (
                                    toCityList.map((cityObj, index) => (
                                        <div
                                            key={index}
                                            className="dropdown-item"
                                            onClick={() => handleCitySelect(cityObj, 'to')}
                                        >
                                            <FaPlane className="me-2" />
                                            <strong>{cityObj.city_name}</strong> &nbsp;
                                            <span>({cityObj.name})</span> &nbsp;
                                            <span className="ms-auto">[{cityObj.code}]</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default CitySegment;