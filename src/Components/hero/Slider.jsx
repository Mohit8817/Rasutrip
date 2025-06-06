import { useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import slidimg1 from '../../assest/1 (1).jpg';
import slidimg2 from '../../assest/1 (2).jpg';
import slidimg3 from '../../assest/1 (1).jpg';
import '../../Style/Slider.css'; // Make sure path is correct
import FlightBooking from '../FlightBooking/FlightBooking';
import TravelTabs from '../FlightBooking/TravelTabs';
import HotelSearchForm from '../HotelSearchForm/HotelSearchForm';

const Slider = () => {
  const [index, setIndex] = useState(0);

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  return (
    <div className="slider-container">
      {/* White box for your components */}
      <div className="overlay-box">

        {/* three tabs  */}
        <div className='travel-tabs'>
          <TravelTabs />
        </div>

        <FlightBooking />
        <HotelSearchForm />
        {/* Add more components here */}
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
