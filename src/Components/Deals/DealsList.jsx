import React from 'react';
import DealCard from './DealCard';
import { Container, Row, Col } from 'react-bootstrap';

import img1 from '../../assest/crd1.jpeg';
import img2 from '../../assest/crd2.jpg';
import img3 from '../../assest/crd3.jpg';

const dealsData = [
  {
    image: img1,
    title: 'cheap-flights',
    subtitle: 'flights',
    type: 'FLIGHT',
  },
  {
    image: img2,
    title: 'From ASIA to the WORLD',
    subtitle: 'SAVE AND EXPLORE GLOBAL DESTINATIONS',
    type: 'BUS',
  },
  {
    image: img3,
    title: 'Get Up To 50% OFF*',
    subtitle: 'Save HUGE with dhamakedaar deals on Hotels, Homestays & Hourly Stays!',
    type: 'HOTEL',
  },
];

const DealsList = () => {
  return (
    <Container className="py-4">
      <Row className="g-4">
        {dealsData.map((deal, index) => (
          <Col key={index} md={4}>
            <DealCard {...deal} />
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default DealsList;
