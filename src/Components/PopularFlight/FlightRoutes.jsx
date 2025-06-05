import React from 'react';
import '../../Style/FlightRoutes.css'; 
import img1 from '../../assest/adiyogi.png';
import img2 from '../../assest/dubai.png';
import img3 from '../../assest/charminar.jpg';
import img4 from '../../assest/chennai.png';
import img5 from '../../assest/tajmahal.jpg';
import img6 from '../../assest/toronto.png';
import img7 from '../../assest/bangkok.png';
import img8 from '../../assest/dubai.png';

const routes = [
  {
    from: 'Coimbatore',
    to: 'Chennai',
    code: 'CJB - MAA',
    image: img1,
  },
  {
    from: 'Chennai',
    to: 'Dubai',
    code: 'MAA - DXB',
    image: img2,
  },
  {
    from: 'Mumbai',
    to: 'Hyderabad',
    code: 'BOM - HYD',
    image: img3,
  },
  {
    from: 'Chennai',
    to: 'Mumbai',
    code: 'MAA - BOM',
    image: img4,
  },
  {
    from: 'Delhi',
    to: 'Mumbai',
    code: 'DEL - BOM',
    image: img5,
  },
  {
    from: 'Toronto',
    to: 'Delhi',
    code: 'YYZ -',
    image: img6 ,
  },
  {
    from: 'Chennai',
    to: 'Bangkok',
    code: 'MAA - BKK',
    image: img7,
  },
  {
    from: 'Dubai',
    to: 'Kochi',
    code: 'DXB - COK',
    image: img8,
  },
];

const FlightRoutes = () => {
  return (
    <section className="flight-routes-section">
      <h3 className="routes-title">
        Popular Flight <span>Routes</span>
      </h3>
      <div className="routes-grid">
        {routes.map((route, idx) => (
          <div className="route-card" key={idx}>
            <div className="route-image-wrapper">
              <img src={route.image} alt={`${route.from} to ${route.to}`} className="route-image" />
            </div>
            <div className="route-info">
              <p className="route-main">
                {route.from} <span className="plane">✈</span> {route.to}
              </p>
              <p className="route-code">{route.code}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FlightRoutes;
