// frontend/src/UsagePage.js

import React, { useEffect, useState } from 'react';
import { Container, Table, Form, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';

function UsagePage() {
  const [usages, setUsages] = useState([]);
  const [filterIND_ID, setFilterIND_ID] = useState('');
  const [filterCouponIndex, setFilterCouponIndex] = useState('');
  const [uniqueIND_IDs, setUniqueIND_IDs] = useState([]);
  const [uniqueCouponIndexes, setUniqueCouponIndexes] = useState([]);

  useEffect(() => {
    fetchUniqueFilters();
    fetchUsages();
  }, []);

  const fetchUniqueFilters = () => {
    axios.get('http://localhost:5000/api/usages')
      .then((response) => {
        const data = response.data;
        const IND_IDs = [...new Set(data.map(u => u.IND_ID))].sort();
        setUniqueIND_IDs(IND_IDs);
        const couponIndexes = [...new Set(data.map(u => u.couponIndex + 1))].sort();
        setUniqueCouponIndexes(couponIndexes);
      })
      .catch((error) => {
        console.error('Error fetching usages for filters:', error);
      });
  };

  const fetchUsages = () => {
    const params = {};
    if (filterIND_ID) params.IND_ID = filterIND_ID;
    if (filterCouponIndex) params.couponIndex = filterCouponIndex - 1;

    axios.get('http://localhost:5000/api/usages', { params })
      .then((response) => {
        setUsages(response.data);
      })
      .catch((error) => {
        console.error('Error fetching usages:', error);
      });
  };

  const handleFilterChange = () => {
    fetchUsages();
  };

  const handleFilterReset = () => {
    setFilterIND_ID('');
    setFilterCouponIndex('');
    fetchUsages();
  };

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">Usage Records</h2>
      <Form className="mb-3">
        <Row>
          <Col md={4}>
            <Form.Group controlId="filterIND_ID">
              <Form.Label>Filter by IND_ID</Form.Label>
              <Form.Control as="select" value={filterIND_ID} onChange={(e) => setFilterIND_ID(e.target.value)}>
                <option value="">All</option>
                {uniqueIND_IDs.map((id) => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="filterCouponIndex">
              <Form.Label>Filter by Coupon</Form.Label>
              <Form.Control as="select" value={filterCouponIndex} onChange={(e) => setFilterCouponIndex(e.target.value)}>
                <option value="">All</option>
                {uniqueCouponIndexes.map((index) => (
                  <option key={index} value={index}>{`Coupon ${index}`}</option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
          <Col md={4} className="d-flex align-items-end">
            <Button variant="primary" onClick={handleFilterChange} className="mr-2">Apply Filters</Button>
            <Button variant="secondary" onClick={handleFilterReset}>Reset Filters</Button>
          </Col>
        </Row>
      </Form>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>IND_ID</th>
            <th>Coupon Used</th>
            <th>Meal Category</th>
            <th>Date</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {usages.length > 0 ? (
            usages.map((usage, index) => (
              <tr key={index}>
                <td>{usage.IND_ID}</td>
                <td>{usage.couponIndex + 1}</td>
                <td>{usage.mealCategory}</td>
                <td>{new Date(usage.timestamp).toLocaleDateString()}</td>
                <td>{new Date(usage.timestamp).toLocaleTimeString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                No usage records found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
}

export default UsagePage;
