import React from 'react';
import './HotelImages.css';
import devilla from "../../assest/devilla.jpg";
import desmall from "../../assest/desmall.jpg";
import des from "../../assest/des.jpg";

const images = [
  devilla,
  desmall,
  des,
  
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
