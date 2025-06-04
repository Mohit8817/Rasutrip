import React from 'react';
import '../../Style/FlightBooking.css'; // Ensure this path is correct
const TripTypeSelector = () => {
    return (
        <div>
            <div className="trip-type-container">

                <div className="trip-type-tab-wrapper">
                    <input
                        type="radio"
                        name="tripType"
                        value="oneway"
                        id="oneway"
                        className="trip-type-input"
                        defaultChecked
                    />
                    <label htmlFor="oneway" className="trip-type-tab">Oneway</label>

                    <input
                        type="radio"
                        name="tripType"
                        value="roundtrip"
                        id="roundtrip"
                        className="trip-type-input"
                    />
                    <label htmlFor="roundtrip" className="trip-type-tab">Round Trip</label>

                    <input
                        type="radio"
                        name="tripType"
                        value="multicity"
                        id="multicity"
                        className="trip-type-input"
                    />
                    <label htmlFor="multicity" className="trip-type-tab">Multi City</label>
                </div>
            </div>
        </div>
    );
};

export default TripTypeSelector;
