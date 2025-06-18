import { StarFill } from "react-bootstrap-icons";
import "./HotelDetails.css";
import { Card } from 'react-bootstrap';

const Heading = () => {
  return (
    <div>
      <Card className="summ_header mt-4 pt-4">
        <h4 className="d-flex align-items-center gap-2 fw-semibold">
          ELIVAAS Kamerios Verano 1 BHK with Pool
          <span className="text-warning">
            {[...Array(3)].map((_, index) => (
              <StarFill key={index} />
            ))}
          </span>
        </h4>
        <p>📍 Pilerne - Candolim Rd Marra India</p>
      </Card></div>
  )
}

export default Heading