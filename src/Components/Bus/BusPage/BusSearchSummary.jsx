import React, { useContext, useState } from "react";
import { useLocation } from "react-router-dom";
import { Container, Row, Col, Button, Modal } from "react-bootstrap";
import { LocationContext } from "../../Context/LocationContext";
import Location from "../../Busbooking/Location";
import TravelDate from "../../Busbooking/TravelDate";
import SearchButton from "../../Common/SearchButton";

const BusSearchSummary = () => {
  const { state } = useLocation();
  const { locationData } = useContext(LocationContext);
  const [showModifyModal, setShowModifyModal] = useState(false);

  // Get initial values from navigation state
  const { fromCity, toCity, fromCityId, toCityId } = state || {};

  // Use date from LocationContext (updated by calendar) instead of navigation state
  const departDate = locationData?.departDate || state?.departDate;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

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
        <Row className="align-items-center text-center text-md-start flex-nowrap overflow-auto">
          <Col xs="auto" md={3} className="mb-2 mb-md-0">
            <div>
              <strong>From</strong>
            </div>
            <div className="text-muted small">{fromCity || "N/A"}</div>
          </Col>
          <Col xs="auto" md={3} className="mb-2 mb-md-0 border-start">
            <div>
              <strong>To</strong>
            </div>
            <div className="text-muted small">{toCity || "N/A"}</div>
          </Col>
          <Col xs="auto" md={3} className="mb-2 mb-md-0 border-start">
            <div>
              <strong>Date</strong>
            </div>
            <div className="text-muted small">{formatDate(departDate)}</div>
          </Col>
          {/* <Col
            xs="auto"
            md={3}
            className="text-md-end text-center mt-2 mt-md-0"
          >
            <Button
              variant="danger"
              className="btn-red"
              onClick={handleModifyClick}
            >
              Modify Search
            </Button>
          </Col> */}

          <Col xs="auto" md={3} className="col-12 mt-3 d-block d-lg-none">
            <Button variant="danger" className="btn-red">
              Filter
            </Button>
          </Col>
        </Row>
      </Container>

      {/* Modify Search Modal - Fixed sizing */}
      <Modal
        show={showModifyModal}
        onHide={handleCloseModal}
        size="xl"
        centered
        dialogClassName="custom-modal-width"
        backdrop="static"
        keyboard={true}
      >
        <Modal.Header closeButton className="border-bottom">
          <Modal.Title className="fw-bold">Modify Your Search</Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-4">
          <Container fluid>
            <Row className="g-3 align-items-end">
              <Col xl={6} lg={7} md={12}>
                <Location />
              </Col>
              <Col xl={4} lg={4} md={8}>
                <TravelDate />
              </Col>
              <Col xl={2} lg={1} md={4}>
                <SearchButton
                  type="bus"
                  onSearchComplete={handleSearchFromModal}
                  className="w-100"
                />
              </Col>
            </Row>
          </Container>
        </Modal.Body>
      </Modal>

      <style jsx>{`
        .custom-modal-width {
          max-width: 100vw;
          width: auto;
        }

        @media (min-width: 1200px) {
          .custom-modal-width {
            max-width: 1300px;
          }
        }

        @media (min-width: 992px) and (max-width: 1199px) {
          .custom-modal-width {
            max-width: 900px;
          }
        }

        @media (max-width: 991px) {
          .custom-modal-width {
            max-width: 95vw;
            margin: 10px;
          }
        }
      `}</style>
    </>
  );
};

export default BusSearchSummary;
