import React, { useContext, useState } from "react";
import { Container, Row, Col, Modal } from "react-bootstrap";
import { HotelSearchContext } from "../../Context/HotelSearchContext";
import CitySelector from "../../HotelSearchForm/CitySelector";
import DateSelector from "../../HotelSearchForm/DateSelector";
import GuestRoomSelector from "../../HotelSearchForm/GuestRoomSelector";
import CountrySelector from "../../HotelSearchForm/CountrySelector";
import SearchButton from "../../Common/SearchButton";

const SearchSummary = () => {
  const { hotelSearchData } = useContext(HotelSearchContext);
  const [showModifyModal, setShowModifyModal] = useState(false);

  const {
    city = "—",
    checkIn = "—",
    checkOut = "—",
    nights = "—",
    guests = "—", // Used in UI
    rooms = "—", // Used in UI
    // adultsCount = 0,          // Used in payload only
    // childrenCount = 0,        // Used in payload only
    // roomDetails = [],         // Used in payload only
  } = hotelSearchData || {};

  const handleModifyClick = () => {
    setShowModifyModal(true);
  };

  const handleCloseModal = () => {
    setShowModifyModal(false);
  };

  const handleSearchFromModal = () => {
    // Close modal and trigger new search
    setShowModifyModal(false);
    // The SearchButton component will handle the actual search logic
  };

  return (
    <>
      <Container className="mt-4 p-3 bg-white shadow-sm rounded border">
        {/* Mobile Layout */}
        <div className="d-block d-md-none">
          {/* First Line: Check-In date | Check-Out date */}
          <div className="text-center mb-1 text-sm">
            <span className="fw-semibold">Check-In</span>{" "}
            <span className="text-muted">{checkIn}</span>
            <span className="mx-2">|</span>
            <span className="fw-semibold">Check-Out</span>{" "}
            <span className="text-muted">{checkOut}</span>
          </div>

          {/* Second Line: Nights number | Rooms & Guests */}
          <div className="text-center mb-2 text-sm">
            <span className="fw-semibold">Nights</span>{" "}
            <span className="text-muted">{nights}</span>
            <span className="mx-2">|</span>
            <span className="fw-semibold">Rooms & Guests</span>{" "}
            <span className="text-muted">
              {rooms} Room{rooms > 1 ? "s" : ""}, {guests} Guest
              {guests > 1 ? "s" : ""}
            </span>
          </div>

          {/* Button */}
          {/* <div className="text-center">
            <Button className="btn-red w-full text-sm" onClick={handleModifyClick}>
              Modify Search
            </Button>
          </div> */}
        </div>

        {/* Desktop Layout */}
        <Row className="items-center text-left d-none d-md-flex">
          <Col md>
            <div className="fw-semibold">Check-In</div>
            <small className="text-muted">{checkIn}</small>
          </Col>

          <Col md>
            <div className="fw-semibold">Check-Out</div>
            <small className="text-muted">{checkOut}</small>
          </Col>

          <Col md>
            <div className="fw-semibold">Nights</div>
            <small className="text-muted">{nights}</small>
          </Col>

          <Col md>
            <div className="fw-semibold">Rooms & Guests</div>
            <small className="text-muted">
              {guests} Guest{guests > 1 ? "s" : ""}, {rooms} Room
              {rooms > 1 ? "s" : ""}
            </small>
          </Col>

          {/* <Col md="auto" className="text-end">
            <Button className="btn-red" onClick={handleModifyClick}>
              Modify Search
            </Button>
          </Col> */}
        </Row>
      </Container>

      {/* Modify Search Modal */}
      <Modal
        show={showModifyModal}
        onHide={handleCloseModal}
        size="xl"
        centered
        dialogClassName="custom-hotel-modal-width"
        backdrop="static"
        keyboard={true}
      >
        <Modal.Header closeButton className="border-bottom">
          <Modal.Title className="fw-bold">Modify Hotel Search</Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-4">
          <Container fluid>
            <Row className="mb-3">
              <Col>
                <h6 className="fw-bold mb-3 text-start">
                  Book Domestic and International Hotels
                </h6>
              </Col>
            </Row>

            <Row className="g-3 align-items-end">
              <Col xl={3} lg={3} md={6} sm={12}>
                <CitySelector />
              </Col>
              <Col xl={3} lg={3} md={6} sm={12}>
                <DateSelector />
              </Col>
              <Col xl={3} lg={3} md={6} sm={12}>
                <GuestRoomSelector />
              </Col>
              <Col xl={2} lg={2} md={4} sm={8}>
                <CountrySelector />
              </Col>
              <Col xl={1} lg={1} md={2} sm={4}>
                <SearchButton
                  type="hotel"
                  onSearchComplete={handleSearchFromModal}
                  className="w-100"
                />
              </Col>
            </Row>
          </Container>
        </Modal.Body>
      </Modal>

      <style jsx>{`
        .custom-hotel-modal-width {
          max-width: 90vw;
          width: auto;
        }

        @media (min-width: 1200px) {
          .custom-hotel-modal-width {
            max-width: 1300px;
          }
        }

        @media (min-width: 992px) and (max-width: 1199px) {
          .custom-hotel-modal-width {
            max-width: 950px;
          }
        }

        @media (max-width: 991px) {
          .custom-hotel-modal-width {
            max-width: 95vw;
            margin: 10px;
          }
        }
      `}</style>
    </>
  );
};

export default SearchSummary;
