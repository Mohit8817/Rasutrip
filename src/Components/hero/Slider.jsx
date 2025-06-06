import { useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import slidimg1 from '../../assest/1 (1).jpg';
import slidimg2 from '../../assest/1 (2).jpg';
import slidimg3 from '../../assest/1 (1).jpg';
import '../../Style/Slider.css'; // Make sure path is correct
import FlightBooking from '../FlightBooking/FlightBooking';
import TravelTabs from '../FlightBooking/TravelTabs';
import HotelSearchForm from '../HotelSearchForm/HotelSearchForm';
import BusBooking from '../Busbooking/BusBooking';

const Slider = () => {
  const [index, setIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('flight'); // Add activeTab state

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  // Function to render tab content
  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'flight':
        return <FlightBooking />;
      case 'hotel':
        return <HotelSearchForm />;
      case 'bus':
        // return <div>Bus Booking Component Coming Soon</div>;
        return <div> <BusBooking /> </div>;
      default:
        return null;
    }
  };

  return (
    <div className="slider-container">
      {/* White box for your components */}
      {/* Three tabs */}
      <div className="overlay-box">
        <div className="travel-tabs">
          <TravelTabs activeTab={activeTab} setActiveTab={setActiveTab} className="" />
        </div>

        {/* Conditionally show active component */}
        {renderActiveTabContent()}
      </div>

      <Carousel activeIndex={index} onSelect={handleSelect} className="slider">
        {[slidimg1, slidimg2, slidimg3].map((img, idx) => (
          <Carousel.Item key={idx}>
            <div className="slider-image-wrapper">
              <img className="d-block w-100" src={img} alt={`Slide ${idx + 1}`} />
              <div className="top-overlay"></div>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
};

export default Slider;
