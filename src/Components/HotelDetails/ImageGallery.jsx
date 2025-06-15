import React, { useState } from "react";
import "./HotelDetails.css";

const images = [
  "/images/card1.jpg",
  "/images/card3.avif",
  "/images/card4.avif",
  "/images/card1.jpg",
  "/images/card1.jpg",
];

const ImageGallery = () => {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <div className="gallery-container">
      {/* Main Selected Image */}
      <div className="main-image-wrapper">
        <img src={selectedImage} alt="Selected View" className="main-image" />
      </div>

      {/* Thumbnail Gallery */}
      <div className="thumbnail-gallery">
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`thumb-${index}`}
            className={`thumbnail ${selectedImage === src ? "active" : ""}`}
            onClick={() => setSelectedImage(src)}
          />
        ))}
        <button className="see-all-btn">See All</button>
      </div>
    </div>
  );
};

export default ImageGallery;
