// client/src/CouponValidityManager.js

import React, { useEffect, useState } from 'react';
import { Container, Table, Form, Button } from 'react-bootstrap';
import axios from 'axios';

// Utility functions for date conversions
const toUTCString = (localDateTime) => {
  const localDate = new Date(localDateTime);
  return localDate.toISOString();
};

const fromUTCString = (utcDateTime) => {
  const utcDate = new Date(utcDateTime);
  const pad = (num) => String(num).padStart(2, '0');

  const year = utcDate.getFullYear();
  const month = pad(utcDate.getMonth() + 1); // Months are zero-indexed
  const day = pad(utcDate.getDate());
  const hours = pad(utcDate.getHours());
  const minutes = pad(utcDate.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

function CouponValidityManager() {
  const [couponValidities, setCouponValidities] = useState([]);
  const [formState, setFormState] = useState({});

  useEffect(() => {
    fetchCouponValidities();
  }, []);

  const API_BASE_URL = 'https://hst-dms.vercel.app/api';

  const fetchCouponValidities = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/coupon-validities`);
      setCouponValidities(response.data);
    } catch (error) {
      console.error('Error fetching coupon validities:', error);
      alert('Error fetching coupon validities.');
    }
  };

  const handleInputChange = (couponIndex, field, value) => {
    setFormState({
      ...formState,
      [couponIndex]: {
        ...formState[couponIndex],
        [field]: value,
      },
    });
  };

  const handleSave = async (couponIndex, id) => {
    const { startDateTime, endDateTime } = formState[couponIndex] || {};

    if (!startDateTime || !endDateTime) {
      alert('Please provide both Start DateTime and End DateTime.');
      return;
    }

    // Convert local datetime to UTC before sending
    const startUTC = toUTCString(startDateTime);
    const endUTC = toUTCString(endDateTime);

    try {
      if (id) {
        // Update existing coupon validity
        await axios.put(`${API_BASE_URL}/coupon-validities/${id}`, {
          couponIndex,
          startDateTime: startUTC,
          endDateTime: endUTC,
        });
      } else {
        // Create new coupon validity
        await axios.post(`${API_BASE_URL}/coupon-validities`, {
          couponIndex,
          startDateTime: startUTC,
          endDateTime: endUTC,
        });
      }
      fetchCouponValidities();
      alert(`Coupon ${couponIndex} validity saved successfully.`);
    } catch (error) {
      console.error('Error saving coupon validity:', error);
      alert('Error saving coupon validity.');
    }
  };

  const handleDelete = async (id, couponIndex) => {
    if (window.confirm(`Are you sure you want to delete validity for Coupon ${couponIndex}?`)) {
      try {
        await axios.delete(`${API_BASE_URL}/coupon-validities/${id}`);
        fetchCouponValidities();
        alert(`Coupon ${couponIndex} validity deleted successfully.`);
      } catch (error) {
        console.error('Error deleting coupon validity:', error);
        alert('Error deleting coupon validity.');
      }
    }
  };

  return (
    <Container className="mt-5">
      <h2>Coupon Validity Manager</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Coupon Index</th>
            <th>Start DateTime</th>
            <th>End DateTime</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {[...Array(9)].map((_, i) => {
            const couponIndex = i + 1;
            const validity = couponValidities.find(cv => cv.couponIndex === couponIndex);
            const formValues = formState[couponIndex] || {};

            return (
              <tr key={couponIndex}>
                <td>{couponIndex}</td>
                <td>
                  <Form.Control
                    type="datetime-local"
                    value={
                      formValues.startDateTime ||
                      (validity ? fromUTCString(validity.startDateTime) : '')
                    }
                    onChange={(e) => handleInputChange(couponIndex, 'startDateTime', e.target.value)}
                  />
                </td>
                <td>
                  <Form.Control
                    type="datetime-local"
                    value={
                      formValues.endDateTime ||
                      (validity ? fromUTCString(validity.endDateTime) : '')
                    }
                    onChange={(e) => handleInputChange(couponIndex, 'endDateTime', e.target.value)}
                  />
                </td>
                <td>
                  <Button
                    variant="primary"
                    onClick={() => handleSave(couponIndex, validity ? validity._id : null)}
                    className="mr-2"
                  >
                    Save
                  </Button>
                  {validity && (
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(validity._id, couponIndex)}
                    >
                      Delete
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Container>
  );
}

export default CouponValidityManager;
