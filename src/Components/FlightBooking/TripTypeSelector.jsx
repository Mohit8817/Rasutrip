import React from 'react';
import '../../Style/FlightBooking.css';

const TripTypeSelector = ({ tripType, setTripType }) => {
    return (
        <div className="trip-type-container">
            <div className="trip-type-tab-wrapper">
                <input
                    type="radio"
                    name="tripType"
                    value="oneway"
                    id="oneway"
                    className="trip-type-input"
                    checked={tripType === 'oneway'}
                    onChange={(e) => setTripType(e.target.value)}
                />
                <label htmlFor="oneway" className="trip-type-tab">Oneway</label>

                <input
                    type="radio"
                    name="tripType"
                    value="roundtrip"
                    id="roundtrip"
                    className="trip-type-input"
                    checked={tripType === 'roundtrip'}
                    onChange={(e) => setTripType(e.target.value)}
                />
                <label htmlFor="roundtrip" className="trip-type-tab">Round Trip</label>

                <input
                    type="radio"
                    name="tripType"
                    value="multicity"
                    id="multicity"
                    className="trip-type-input"
                    checked={tripType === 'multicity'}
                    onChange={(e) => setTripType(e.target.value)}
                />
                <label htmlFor="multicity" className="trip-type-tab">Multi City</label>
            </div>
        </div>
    );
};

export default TripTypeSelector;
