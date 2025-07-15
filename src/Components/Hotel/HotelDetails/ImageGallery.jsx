import React, { useState, useEffect } from "react";
import "./HotelDetails.css";

const ImageGallery = ({ images = [] }) => {
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    if (images.length > 0) {
      setSelectedImage(images[0]);
    }
  }, [images]);

  if (!images.length) {
    return <p className="text-muted">No images available</p>;
  }

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
