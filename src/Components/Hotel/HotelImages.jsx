import React from 'react';
import './HotelListingPage.css';

const image = [
  "/images/card1.jpg",
  "/images/card3.avif",
  "/images/card4.avif",
  "/images/card1.jpg",
  "/images/card1.jpg",
];

const HotelImages = () => {
  return (
    <div className="image-gallery">
      <img className="main-image" src={image[0]} alt="Hotel Main" />
      <div className="thumbnail-row">
        {image.map((img, index) => (
          <img key={index} className="thumbnail" src={img} alt={`thumb-${index}`} />
        ))}
      </div>
    </div>
  );
};

export default HotelImages;
