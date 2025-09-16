"use cleint";
import { useState, useEffect, useContext } from "react";
import { Container, Row, Col } from "react-bootstrap";
import TripTypeSelector from "./TripTypeSelector";
import "../../Style/FlightBooking.css"; // Make sure this path is correct
import LocationInput from "./LocationInput";
import DatePicker from "./DatePicker";
import FareTypeSelector from "./FareTypeSelector";
import PassengerClass from "./PassengerClass";
import SearchButton from "../Common/SearchButton";
import moment from "moment";
import CitySegment from "./MultiCity/CitySegment";
import DateSelect from "./MultiCity/DateSelect";
import MultiCityForm from "./MultiCity/MultiCityForm";
import AddCityButton from "./MultiCity/AddCityButton";
import SecondDateSelecter from "./MultiCity/SecondDateSelecter";
import AddMorecity from "./MultiCity/AddMorecity";
import AddMorecitydatapick from "./MultiCity/AddMorecitydatapick";
import { LocationContext } from "../Context/LocationContext";

const FlightBooking = () => {
  const [tripType, setTripType] = useState("oneway");
  const { locationData, setLocationData } = useContext(LocationContext);
  const [toCityFromCitySegment, setToCityFromCitySegment] = useState("");
  const [fareData, setFareData] = useState({});
  const [segments, setSegments] = useState([]);
  const [cityComponents, setCityComponents] = useState([]);

  const handleAddCityClick = () => {
    if (cityComponents.length < 2) {
      const newCity = { id: Date.now() };
      setCityComponents([...cityComponents, newCity]);
    }
  };
  // const handleSelect = (dataSelect) => {
  //     console.log('dataSelect', dataSelect)
  // }
  // const handleRemoveCity = (id) => {
  //     const updatedComponents = cityComponents.filter((city) => city.id !== id);
  //     setCityComponents(updatedComponents);
  // };
  const handleFareDataChange = (data) => {
    setFareData(data);
  };

  useEffect(() => {
    const resKey = localStorage.getItem("locationData");
    const CheckData = JSON.parse(resKey);

    if (CheckData) {
      if (CheckData[0]?.from === "") {
        setSegments([
          {
            id: 0,
            from: "Delhi",
            to: "Mumbai",
            Origin: "DEL",
            Destination: "BOM",
            PreferredTime: new Date(),
          },
          // { id: 1, Origin: "BOM", Destination: "DEL", PreferredTime: new Date(new Date().setDate(new Date().getDate() + 1)) },
        ]);
      } else {
        setSegments(CheckData);
      }
    } else {
      setSegments([
        {
          id: 0,
          from: "Delhi",
          to: "Mumbai",
          Origin: "DEL",
          Destination: "BOM",
          PreferredTime: new Date(),
        },
        // { id: 1, Origin: "BOM", Destination: "DEL", PreferredTime: new Date(new Date().setDate(new Date().getDate() + 1)) },
      ]);
    }
  }, []);

  useEffect(() => {}, [segments]);
  const handleDateChange = (id, selectedDate) => {
    setSegments((prev) => {
      let newSegments = [...prev];
      const changedIndex = newSegments.findIndex((seg) => seg.id === id);
      if (changedIndex === -1) return prev;
      newSegments[changedIndex] = {
        ...newSegments[changedIndex],
        PreferredTime: formatDateToYMD(new Date(selectedDate)), // yyyy-mm-dd
      };

      for (let i = changedIndex + 1; i < newSegments.length; i++) {
        let nextDate = new Date(selectedDate); // hamesha original date se naya object
        nextDate.setDate(nextDate.getDate() + (i - changedIndex)); // har row ek din aage
        newSegments[i] = {
          ...newSegments[i],
          PreferredTime: formatDateToYMD(nextDate), // yyyy-mm-dd
        };
      }

      return newSegments;
    });
  };

  function formatDateToYMD(date) {
    return date.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  }
  const handleCityChange = (id, city) => {
    setSegments((prev) =>
      prev.map((seg) => {
        if (seg.id === id) {
          if (city.type === "from") {
            return {
              ...seg,
              from: city.cityObj.city,
              Origin: city.cityObj.code,
            };
          } else if (city.type === "to") {
            return {
              ...seg,
              to: city.cityObj.city,
              Destination: city.cityObj.code,
            };
          }
        }
        return seg;
      })
    );
  };
  const addSegment = () => {
    const newId =
      segments.length > 0 ? Math.max(...segments.map((s) => s.id)) + 1 : 0;
    const lastSeg = segments[segments.length - 1];
    let nextDate = new Date();
    if (lastSeg?.PreferredTime) {
      const lastDate = new Date(lastSeg.PreferredTime);
      lastDate.setDate(lastDate.getDate() + 1);
      nextDate = lastDate;
    }

    setSegments((prev) => [
      ...prev,
      {
        id: newId,
        from: lastSeg.to,
        to: lastSeg.from,
        Origin: lastSeg?.Destination, // 👈 last ke "to" ko new ka "from"
        Destination: lastSeg?.Origin, // 👈 last ke "from" ko new ka "to"
        PreferredTime: nextDate, // 👈 last date +1
      },
    ]);
  };
  const removeSegment = (id) => {
    setSegments((prev) => prev.filter((seg) => seg.id !== id));
  };
  if (tripType == "multicity") {
    localStorage.setItem("locationData", JSON.stringify(segments));
  }
  return (
    <div className="booking-container pt-0 mt-0">
      <Container>
        <Row className="align-items-center">
          <Col lg={6}>
            <div className="tripselector">
              <TripTypeSelector tripType={tripType} setTripType={setTripType} />
            </div>
          </Col>
          {/* <Col lg={6} className="text-end">
                        <p className="flight-tagline">
                            Millions of cheap flights. One simple search
                        </p>
                    </Col> */}
        </Row>

        {/* One way trip components  */}
        {tripType !== "multicity" && (
          <Row className="mt-2">
            <Col xs={12} sm={12} md={6} lg={5} className="mb-2">
              <LocationInput />
            </Col>

            <Col xs={12} sm={6} md={6} lg={3} className="mb-2">
              <DatePicker tripType={tripType} setTripType={setTripType} />
            </Col>

            <Col xs={12} sm={6} md={6} lg={3} className="mb-2">
              <PassengerClass />
            </Col>

            <Col xs={12} sm={12} md={12} lg={1}>
              <SearchButton type="flight" />
            </Col>
          </Row>
        )}
        {tripType === "multicity" && (
          <Container className="p-0 m-0">
            {segments.map((seg, index) => (
              <Row className="mt-2" key={seg.id}>
                <Col xs={12} sm={12} md={6} lg={5} className="mb-2">
                  <CitySegment
                    id={index}
                    from={seg.from}
                    to={seg.to}
                    onSelect={(city) => handleCityChange(seg.id, city)}
                    onToCityChange={setToCityFromCitySegment}
                  />
                </Col>

                <Col xs={12} sm={6} md={3} lg={3} className="mb-2">
                  <DateSelect
                    index={index}
                    DateDefault={seg.PreferredTime}
                    onDateChange={(date) => handleDateChange(seg.id, date)}
                  />
                </Col>

                {index === 0 && (
                  <>
                    <Col xs={12} sm={6} md={3} lg={3} className="mb-2">
                      <PassengerClass />
                    </Col>
                    <Col xs={12} sm={12} md={12} lg={1}>
                      <SearchButton type="flight" />
                    </Col>
                  </>
                )}

                {/* Second row se sirf remove button option */}
                {index > 0 && (
                  <Col xs={6} sm={6} md={2} lg={1} className="mb-2">
                    <button
                      className="btn btn-danger w-100"
                      onClick={() => removeSegment(seg.id)}
                    >
                      X
                    </button>
                  </Col>
                )}
              </Row>
            ))}

            {/* Add more city button */}
            <Row className="mt-2">
              <Col xs={12}>
                <button className="Mybutton" onClick={addSegment}>
                  + Add City
                </button>
              </Col>
            </Row>

            {/* Add city row  */}
          </Container>
        )}
        <Row>
          <Col>
            <FareTypeSelector onDataChange={handleFareDataChange} />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default FlightBooking;
