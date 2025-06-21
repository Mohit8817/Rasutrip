import { Card, Form, Row, Col, Button } from 'react-bootstrap';
import '../../Style/user.css';

const AgentLogin = () => {
  return (
    <div className="d-flex justify-content-center align-items-center agent-login-container">
      <Card className='agent-login-card'>
        <div className="text-center">
          <h2 className="fw-bold">Sign Up Form</h2>
          <p className="">sign up now to become a agent</p>
        </div>

        <Form>
          {/* Basic Information Section */}
          <div className="form-section-box">
            <div className="section-header">Basic Information</div>

            <Row className="mb-3">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control type="text" placeholder="Enter Name" />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Mobile Number</Form.Label>
                  <Form.Control type="text" placeholder="Mobile No." />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Email ID</Form.Label>
                  <Form.Control type="email" placeholder="Email ID" />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>City</Form.Label>
                  <Form.Control type="text" placeholder="City" />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label>Remark</Form.Label>
              <Form.Control as="textarea" rows={2} placeholder="Enter Remark" />
            </Form.Group>
          </div>


          <div className="form-section-box mt-4">
            <div className="section-header">KYC Information</div>

            {/* Company & Aadhar Info */}
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Company Name</Form.Label>
                  <Form.Control type="text" placeholder="Company Name" />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Aadhar Number</Form.Label>
                  <Form.Control type="text" placeholder="Enter Aadhar Number" />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Aadhar Document</Form.Label>
                  <Form.Control type="file" />
                  <div className="text-danger small mt-1">
                    File Type Allowed (jpg|jpeg|gif|png|pdf) and Max File Size 8MB
                  </div>
                </Form.Group>
              </Col>
            </Row>

            {/* PAN Details */}
            <hr />
            <h6 className="mt-3 mb-2 fw-bold">PAN Details</h6>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>PAN Name</Form.Label>
                  <Form.Control type="text" placeholder="Name As Per PAN" />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>PAN Number</Form.Label>
                  <Form.Control type="text" placeholder="PAN No." />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>PAN Document</Form.Label>
                  <Form.Control type="file" />
                  <div className="text-danger small mt-1">
                    File Type Allowed (jpg|jpeg|gif|png|pdf) and Max File Size 8MB
                  </div>
                </Form.Group>
              </Col>
            </Row>

            {/* GST Details */}
            <hr />
            <h6 className="mt-3 mb-2 fw-bold">GST Details</h6>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>GST Registration</Form.Label>
                  <Form.Select>
                    <option value="">Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>GST Number</Form.Label>
                  <Form.Control type="text" placeholder="GST No." />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>GST Document</Form.Label>
                  <Form.Control type="file" />
                  <div className="text-danger small mt-1">
                    File Type Allowed (jpg|jpeg|gif|png|pdf) and Max File Size 8MB
                  </div>
                </Form.Group>
              </Col>
            </Row>
          </div>

          <Row className="mt-4 text-center">
            <Col lg={7}>
              <Form.Check
                type="checkbox"
                id="termsCheckbox"
                className="mb-2 me-0 pe-0"
                label={
                  <span className="terms-text">
                    By proceeding, you agree with our <a href="/">Terms of Service</a> & <a href="/">Privacy Policy</a>
                  </span>
                }
              />
            </Col>

            <Col lg={5}>
              <p className="login-link mb-2">
                Do you already have an account? <a href="/">Login here</a>
              </p>
            </Col>

            <Col md={12}>
              <Button variant="primary" className="btn-red w-50 mt-3">Submit</Button>
            </Col>
          </Row>


        </Form>
      </Card>
    </div>
  )
}

export default AgentLogin