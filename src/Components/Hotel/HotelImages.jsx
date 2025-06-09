import React from 'react';
import './HotelImages.css';

const images = [
  "/images/bathroom1.jpg",
  "/images/bathroom2.jpg",
  "/images/bathroom3.jpg",
  "/images/bathroom4.jpg",
];

const HotelImages = () => {
  return (
    <div className="image-gallery">
      <img className="main-image" src={images[0]} alt="Hotel Main" />
      <div className="thumbnail-row">
        {images.map((img, index) => (
          <img key={index} className="thumbnail" src={img} alt={`thumb-${index}`} />
        ))}
      </div>
    </div>
  );
};

export default HotelImages;
