import React from "react";
import "./HotelDetails.css";
import { Container, Row, Col } from 'react-bootstrap';
import Heading from "./Heading";
import ImageGallery from "./ImageGallery";
import BookingInfoCard from "./BookingInfoCard";
import RoomCard from "./RoomCard";
import Amenities from "./Amenities";
import AboutHotel from "./AboutHotel";

const HotelDetailsPage = () => {
  return (
    <>
      <Container className="mt-5 pt-5">
        <Row>
          <Col>
            <Heading />
          </Col>
        </Row>

        <Row className="mt-3">
          <Col lg={8}>
            <ImageGallery />
            <RoomCard />
            <Amenities />
            <AboutHotel />
          </Col>
          <Col lg={4}>
            <BookingInfoCard />

            <div className="map-placeholder mt-2">
              <iframe
                title="hotel-map"
                width="100%"
                height="400"
                frameBorder="0"
                style={{ border: 0 }}
                src="https://maps.google.com/maps?q=Pilerne%20-%20Candolim%20Rd,%20Marra,%20India&t=&z=13&ie=UTF8&iwloc=&output=embed"
                allowFullScreen
              />
            </div>
          </Col>
        </Row>
      </Container>

    </>
  );
};

export default HotelDetailsPage;
