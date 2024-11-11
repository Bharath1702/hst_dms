// frontend/src/UsagePage.js

import React, { useEffect, useState } from 'react';
import { Container, Table, Form, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';

function UsagePage() {
  const [usages, setUsages] = useState([]);
  const [filteredUsages, setFilteredUsages] = useState([]);
  const [filterIND_ID, setFilterIND_ID] = useState('');
  const [filterCouponIndex, setFilterCouponIndex] = useState('');
  const [uniqueCouponIndexes, setUniqueCouponIndexes] = useState([]);

  useEffect(() => {
    fetchUniqueFilters();
    fetchUsages();
  }, []);

  const fetchUniqueFilters = () => {
    axios.get('http://localhost:5000/api/usages')
      .then((response) => {
        const data = response.data;
        const couponIndexes = [...new Set(data.map(u => u.couponIndex + 1))].sort();
        setUniqueCouponIndexes(couponIndexes);
      })
      .catch((error) => {
        console.error('Error fetching usages for filters:', error);
      });
  };

  const fetchUsages = () => {
    axios.get('http://localhost:5000/api/usages')
      .then((response) => {
        setUsages(response.data);
        setFilteredUsages(response.data); // Initialize filteredUsages with full data
      })
      .catch((error) => {
        console.error('Error fetching usages:', error);
      });
  };

  const handleFilterChange = () => {
    let updatedUsages = [...usages];

    if (filterIND_ID) {
      // Apply partial match on IND_ID
      updatedUsages = updatedUsages.filter((usage) =>
        usage.IND_ID.includes(filterIND_ID)
      );
    }

    if (filterCouponIndex) {
      updatedUsages = updatedUsages.filter(
        (usage) => usage.couponIndex + 1 === parseInt(filterCouponIndex)
      );
    }

    setFilteredUsages(updatedUsages);
  };

  const handleFilterReset = () => {
    setFilterIND_ID('');
    setFilterCouponIndex('');
    setFilteredUsages(usages); // Reset to show all usages
  };

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">Usage Records</h2>
      <Form className="mb-3">
        <Row>
          <Col md={4}>
            <Form.Group controlId="filterIND_ID">
              <Form.Label>Search by IND_ID</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter IND_ID"
                value={filterIND_ID}
                onChange={(e) => setFilterIND_ID(e.target.value)}
              />
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
          {filteredUsages.length > 0 ? (
            filteredUsages.map((usage, index) => (
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
