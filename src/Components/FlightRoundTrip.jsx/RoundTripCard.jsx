"use client";
import React from "react";
import { useEffect, useState, useMemo, useRef } from "react";
import { Card, Row, Col, Form, Container } from "react-bootstrap";
import { Button, Tab, Nav, Table } from "react-bootstrap";
import { fetchFareRules } from "../APIS/FlightApi/FlightApi";

import moment from "moment";
import InterRoundtripCard from "./InterRoundtripCard";
const safeText = (value) => value || "N/A";
const formatTime = (time) => (time ? moment(time).format("hh:mm A") : "N/A");
const formatDate = (time) =>
  time ? moment(time).format("DD MMM YYYY") : "N/A";

const RoundTripCard = ({ flight, selectedFare, onSelect, type }) => {
  const segment = flight?.Segments?.[0]?.[0];
  const { Airline, Origin, Destination, TotalDuration } = segment || {};
  const fareList = flight?.FareList || [];
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("flight");
  const [loading, setLoading] = useState(true);
  const [fareRules, setFareRules] = useState([]);
  const [error, setError] = useState(null);
  const hasFetchedRef = useRef(false);
  const userIp = localStorage.getItem("UserIp") || "";
  const searchToken = localStorage.getItem("searchToken") || "";
  const formatFullDateTime = (datetimeStr) => {
    const date = new Date(datetimeStr);
    const options = {
      month: "short",
      day: "2-digit",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    return date.toLocaleString("en-US", options).replace(",", "");
  };

  const formatDuration = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const containerStyle = {
    marginTop: "5px",
    borderTop: "2px solid #292323",
    position: "relative",
    width: "70px",
  };

  const beforeStyle = {
    content: '""',
    position: "absolute",
    borderStyle: "solid",
    borderWidth: "10px 10px 0 0",
    borderColor: "#292323 transparent transparent transparent",
    right: "-1.5px",
    top: "-10px",
    transform: "scaleY(-1)",
  };

  const farePayload = useMemo(
    () => ({
      UserIp: userIp,
      ResultIndex: flight.FareList[0].FareId || "",
      SearchTokenId: searchToken,
    }),
    [userIp, searchToken, flight.FareList[0].FareId]
  );

  const fetchData = async () => {
    try {
      const res = await fetchFareRules(farePayload);
      if (res?.Error?.ErrorCode === 0 && Array.isArray(res?.Result)) {
        setFareRules(res.Result);
      } else {
        console.warn(
          "API returned error or empty result:",
          res?.Error?.ErrorMessage
        );
        setFareRules([]);
      }
    } catch (err) {
      console.error("API call failed:", err);
      setError(err);
      setFareRules([]);
    } finally {
      setLoading(false);
    }
  };
  const handleFareSelect = (selectedFareItem) => {
    onSelect(flight, selectedFareItem);
  };

  return (
    <Container className="mb-4 mt-4">
      {/* <Row>
        <Col md={12}> */}
      <Card
        role="button"
        tabIndex={0}
        className={`shadow-sm p-3 round-trip-card ${
          selectedFare?.FareID ? "border-primary border-2" : ""
        }`}
      >
        <Row className="align-items-center">
          <Col md={3} className="">
            <img className=" w-[30px] h-[30px] " src={Airline.airlineLogo} />
            <div className=" mt-1 text-12 ">
              {safeText(Airline?.AirlineName)}
            </div>
            <div className="text-muted small">
              {Airline.AirlineCode}-{safeText(Airline?.FlightNumber)}
            </div>
          </Col>

          <Col md={3} className="">
            <div className="fw-bold text-14  ">
              {safeText(Origin?.AirportCode)}
            </div>
            <div className="fw-semibold text-12">
              {formatTime(Origin?.DepartTime)}
            </div>
            <div className="text-muted small text-[14px]">
              {formatDate(Origin?.DepartTime)}
            </div>
          </Col>

          <Col md={3} className="text-center">
            <div className="text-muted text-12">{}</div>
            <div className="my-1 text-12">
              <span className="dot"></span>
              <span className="line"></span>
              <span className="dot"></span>
            </div>
            <div className="text-12">
              {TotalDuration ? `${TotalDuration} mins` : "N/A"}
            </div>
          </Col>

          <Col md={3} className="text-center">
            <div className="fw-bold text-14 ">
              {safeText(Destination?.AirportCode)}
            </div>
            <div className="fw-semibold text-12">
              {formatTime(Destination?.ArrivalTime)}
            </div>
            <div className="text-muted small">
              {formatDate(Destination?.ArrivalTime)}
            </div>
          </Col>
        </Row>

        {/* <Row className="align-items-center text-center text-md-start">
          <Col
            xs={12}
            md={3}
            className="d-flex flex-column align-items-center align-items-md-start mb-3 mb-md-0"
          >
            <img
              className="w-[30px] h-[30px] mb-1"
              src={Airline.airlineLogo}
              alt="Airline Logo"
            />
            <div className="text-12 fw-semibold">
              {safeText(Airline?.AirlineName)}
            </div>
            <div className="text-muted small">
              {Airline.AirlineCode}-{safeText(Airline?.FlightNumber)}
            </div>
          </Col>

          <Col xs={12} md={3} className="mb-3 mb-md-0">
            <div className="fw-bold text-14">
              {safeText(Origin?.AirportCode)}
            </div>
            <div className="fw-semibold text-12">
              {formatTime(Origin?.DepartTime)}
            </div>
            <div className="text-muted small">
              {formatDate(Origin?.DepartTime)}
            </div>
          </Col>

          <Col xs={12} md={3} className="text-center mb-3 mb-md-0">
            <div className="text-muted text-12">Duration</div>
            <div className="my-1 text-12 d-flex justify-content-center align-items-center">
              <span className="dot"></span>
              <span className="line mx-1"></span>
              <span className="dot"></span>
            </div>
            <div className="text-12">
              {TotalDuration ? `${TotalDuration} mins` : "N/A"}
            </div>
          </Col>

          <Col xs={12} md={3} className="text-center text-md-start">
            <div className="fw-bold text-14">
              {safeText(Destination?.AirportCode)}
            </div>
            <div className="fw-semibold text-12">
              {formatTime(Destination?.ArrivalTime)}
            </div>
            <div className="text-muted small">
              {formatDate(Destination?.ArrivalTime)}
            </div>
          </Col>
        </Row> */}

        <small className="text-muted mt-2 text-12 d-block">
          Airline Remark: {safeText(fareList?.[0]?.AirlineRemark)}
        </small>

        <div className="fare-options mt-2">
          {fareList?.map((fare, index) => (
            <div
              key={fare?.FareID || `fare-${index}`}
              onClick={(e) => {
                e.stopPropagation();
                handleFareSelect(fare);
              }}
              className="d-flex text-12 align-items-center justify-content-between py-2 border-bottom"
            >
              <Form.Check
                type="radio"
                name={`${type}-flight-${flight?.ResultIndex}`}
                className="me-2"
                onChange={() => handleFareSelect(fare)}
                // checked={index==0}
                checked={selectedFare?.FareId == fare?.FareId}
              />
              <div className="me-auto">
                <span className="fw-semibold">
                  ₹ {fare?.Fare?.BaseFare || "N/A"}
                </span>{" "}
                <span className="badge text-8 bg-secondary text-uppercase me-2">
                  {fare?.FareType || ""}
                </span>
                <div className="text-muted text-12 small">
                  {fare?.CabinClass || "N/A"},{" "}
                  <span
                    className={
                      fare?.IsRefundable
                        ? "text-success text-12"
                        : "text-danger text-12"
                    }
                  >
                    {fare?.IsRefundable ? "Refundable" : "Non Refundable"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div
          className="flight-details-toggle mt-2 cursor-pointer"
          onClick={() => {
            if (!hasFetchedRef.current) {
              fetchData();
              hasFetchedRef.current = true; // ✅ block future API calls
            }
            setShowDetails(!showDetails);
          }}
        >
          {showDetails ? "Hide Details -" : "Flight Details +"}
        </div>
        {showDetails && (
          <div className="flight-tab-box mt-4 border rounded p-3 bg-light-gray">
            <Tab.Container
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
            >
              <Nav variant="tabs" className="mb-3">
                <Nav.Item>
                  <Nav.Link eventKey="flight">Flight Details</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="fare-detail">Fare Details</Nav.Link>
                </Nav.Item>

                <Nav.Item>
                  <Nav.Link eventKey="rules">Fare Rules</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="baggage">Baggage</Nav.Link>
                </Nav.Item>
              </Nav>

              <Tab.Content>
                <Tab.Pane eventKey="flight">
                  <Tab.Container defaultActiveKey="flight">
                    <Row>
                      <Col sm={12}>
                        <Tab.Content>
                          <Tab.Pane eventKey="flight">
                            <Card className="mt-3 p-3 shadow-sm border">
                              <span className="text-12">
                                {segment.Origin.CityName} →{" "}
                                {segment.Destination.CityName}
                              </span>
                              <small className="text-12">
                                {formatDate(segment.Origin.DepartTime)}
                              </small>
                              {/* Delhi → Mumbai <small>Wed, Jul 16 2025</small> */}
                              {/* Segment 1 */}

                              {flight.Segments[0].map((segment, index) => (
                                <div key={index}>
                                  {/* Flight Segment UI */}
                                  <Row className="align-items-center1 mb-4">
                                    <Col md={3} className="text-center1">
                                      <img
                                        src={segment.Airline.airlineLogo}
                                        alt={segment.Airline.AirlineName}
                                        className="img-fluid mb-2 w-10 h-10"
                                        style={{ maxWidth: "50px" }}
                                      />
                                      <h6 className="mb-0 text-12 ">
                                        {segment.Airline.AirlineName}
                                      </h6>
                                      <small className="text-8 ">
                                        {segment.Airline.AirlineCode}-
                                        {segment.Airline.FlightNumber}
                                      </small>
                                    </Col>

                                    <Col md={9}>
                                      <Row className="text-center gy-2">
                                        <Col md={4}>
                                          <h6 className="fw-bold text-12">
                                            {" "}
                                            <i class="fa fa-plane-departure"></i>{" "}
                                            {segment.Origin.CityName} ,{" "}
                                            {segment.Origin.CountryName}
                                          </h6>
                                          <p className="mb-0 text-12">
                                            <small>
                                              {formatFullDateTime(
                                                segment.Origin.DepartTime
                                              )}
                                            </small>
                                          </p>
                                          <small className="text-12">
                                            {segment.Origin.AirportName}
                                          </small>
                                          <br />
                                          {segment.Origin.Terminal && (
                                            <small className="text-12">
                                              Terminal {segment.Origin.Terminal}
                                            </small>
                                          )}
                                        </Col>

                                        <Col md={4}>
                                          <div className="position-absolute text-center text-8">
                                            <strong>
                                              {formatDuration(segment.Duration)}
                                            </strong>
                                            <br />
                                            <div style={containerStyle}>
                                              <span style={beforeStyle}></span>
                                            </div>
                                            <small className="text-muted">
                                              Duration
                                            </small>
                                          </div>
                                        </Col>

                                        <Col md={4} className="text-12">
                                          <h6 className="fw-bold text-12">
                                            {" "}
                                            <i class="fa fa-plane-arrival"></i>{" "}
                                            {segment.Destination.CityName},{" "}
                                            {segment.Destination.CountryName}
                                          </h6>
                                          <p className="mb-0 text-12">
                                            <small>
                                              {formatFullDateTime(
                                                segment.Destination.ArrivalTime
                                              )}
                                            </small>
                                          </p>
                                          {segment.Destination.AirportName && (
                                            <small>
                                              {segment.Destination.AirportName}
                                            </small>
                                          )}
                                          <br />
                                          {segment.Destination.Terminal && (
                                            <small>
                                              Terminal{" "}
                                              {segment.Destination.Terminal}
                                            </small>
                                          )}
                                        </Col>
                                      </Row>

                                      <Row className="mt-3">
                                        <Col md={6}>
                                          <small className="text-12">
                                            {flight.FareList[0].CabinClass}
                                          </small>
                                        </Col>
                                        <Col md={6}>
                                          <small className="text-12">
                                            <strong>Craft:</strong>{" "}
                                            {segment.Craft}
                                          </small>
                                        </Col>
                                      </Row>
                                    </Col>
                                  </Row>

                                  {/* Layover row (only shown if NOT last segment) */}
                                  {flight.Segments[0].length > 1 &&
                                    index < flight.Segments[0].length - 1 && (
                                      <Row className="text-center">
                                        <Col>
                                          <hr className="my-2" />
                                          <span className="text-danger fw-bold">
                                            LAYOVER :{" "}
                                            {segment.Layover ||
                                              segment.LayoverTime}{" "}
                                            {segment.Destination.CityName}
                                          </span>
                                          <hr className="my-2" />
                                        </Col>
                                      </Row>
                                    )}
                                </div>
                              ))}

                              {/* end Segment 2 */}
                            </Card>
                          </Tab.Pane>
                        </Tab.Content>
                      </Col>
                    </Row>
                  </Tab.Container>
                </Tab.Pane>
                <Tab.Pane eventKey="fare-detail">
                  <Tab.Container className="my-4">
                    <h5 className="fw-bold mb-3">Fare Details for ADULT</h5>
                    <Table bordered hover responsive>
                      <thead className="table-light">
                        <tr>
                          <th>Type</th>
                          <th>Fare</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Base Price</td>
                          <td>₹ {flight.FareList[0].Fare.BaseFare} x 1</td>
                          <td>₹ {flight.FareList[0].Fare.BaseFare}</td>
                        </tr>
                        <tr>
                          <td>Taxes and Fees</td>
                          <td>₹ {flight.FareList[0].Fare.Tax} x 1</td>
                          <td>₹ {flight.FareList[0].Fare.Tax}</td>
                        </tr>
                        <tr>
                          <td>Service and Other Charges</td>
                          <td>₹ {flight.FareList[0].Fare.OtherCharges}</td>
                          <td>₹ {flight.FareList[0].Fare.OtherCharges}</td>
                        </tr>
                        <tr>
                          <td>GST</td>
                          <td>₹ 0</td>
                          <td>₹ 0</td>
                        </tr>
                        <tr>
                          <td>Discount(-)</td>
                          <td>₹ {flight.FareList[0].Fare.Discount}</td>
                          <td>₹ {flight.FareList[0].Fare.Discount}</td>
                        </tr>
                        <tr className="fw-bold">
                          <td colSpan={2}>Total</td>
                          <td>
                            ₹{" "}
                            {flight.FareList[0].Fare.BaseFare +
                              flight.FareList[0].Fare.Tax +
                              flight.FareList[0].Fare.OtherCharges -
                              flight.FareList[0].Fare.Discount}
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </Tab.Container>
                </Tab.Pane>

                <Tab.Pane eventKey="rules">
                  <div className="p-3">
                    <Table striped bordered hover responsive>
                      <thead>
                        <tr>
                          <th>Fare Rule Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fareRules.map((item, index) => (
                          <tr key={index}>
                            <td>
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: item.FareRuleDetail,
                                }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Tab.Pane>

                <Tab.Pane eventKey="baggage">
                  <div className="p-3">
                    <table className="table table-bordered text-center align-middle">
                      <thead className="table-light">
                        <tr>
                          <th className="fw-bold">Sector</th>
                          <th className="fw-bold">Check-In</th>
                          <th className="fw-bold">Cabin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {flight.FareList[0].SeatBaggage[0].map(
                          (item, index) => (
                            <tr key={index}>
                              <td>{item.Sector}</td>
                              <td>{item.CheckIn || ""}</td>
                              <td>{item.Cabin || ""}</td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </div>
        )}
      </Card>
      {/* </Col>
      </Row> */}
    </Container>
  );
};

export default RoundTripCard;
