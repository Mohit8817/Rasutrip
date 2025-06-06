import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../Style/HotelSearchForm.css'; // Add your CSS here

const CitySelector = () => {
    return (
        <div className="container ">
            <div className="rounded-3">              
                <div className="city_box ">
                    <label className="City_label">CITY</label>
                    <input
                        type="text"
                        className="form-control border-0 fw-bold city-input"
                        placeholder="SAIPEM, GOA, INDIA"
                    />
                </div>
            </div>
        </div>
    );
};

export default CitySelector;
