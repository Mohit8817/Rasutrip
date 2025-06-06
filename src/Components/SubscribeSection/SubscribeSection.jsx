import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { FaUser, FaEnvelope } from 'react-icons/fa';

const SubscribeSection = () => {
  return (
    <div className="bg-[#f1f8ff] py-10 border-t border-gray-200">
      <Container>
        <Row className="items-center">
          {/* Left Text Section */}
          <Col lg={4} className="mb-4 lg:mb-0">
            <h2 className="text-3xl font-semibold">
              Stay Up <span className="font-bold">to Date</span>
            </h2>
            <p className="text-gray-700 mt-2">Subscribe now and receive the latest travel news.</p>
          </Col>

          {/* Right Form Section */}
          <Col lg={8}>
            <Form className="flex flex-wrap gap-3 items-center">
              {/* Name Input */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black">
                  <FaUser />
                </span>
                <Form.Control
                  type="text"
                  placeholder="Your Name"
                  className="pl-10 pr-4 py-2 w-[220px] rounded-md border border-black text-sm"
                />
              </div>

              {/* Email Input */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black">
                  <FaEnvelope />
                </span>
                <Form.Control
                  type="email"
                  placeholder="Enter Your Email"
                  className="pl-10 pr-4 py-2 w-[260px] rounded-md border border-black text-sm"
                />
              </div>

              {/* Subscribe Button */}
              <Button
                type="submit"
                className="bg-[#6a0dad] hover:bg-[#5500a6] text-white font-semibold px-5 py-2 rounded-md"
              >
                SUBSCRIBE
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SubscribeSection;
