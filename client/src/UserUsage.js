// client/src/UserUsage.js

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Table } from 'react-bootstrap';
import axios from 'axios';

function UserUsage() {
  const { indId } = useParams();
  const [usages, setUsages] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/user/${indId}`)
      .then((response) => {
        setUser(response.data);
      })
      .catch((error) => {
        console.error('Error fetching user details:', error);
      });

    axios
      .get(`http://localhost:5000/api/usages/${indId}`)
      .then((response) => {
        setUsages(response.data);
      })
      .catch((error) => {
        console.error('Error fetching usages:', error);
      });
  }, [indId]);

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">
        Usage History for {user ? user.FullName : 'User'}
      </h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
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
                <td>{usage.couponIndex + 1}</td>
                <td>{usage.mealCategory}</td>
                <td>{new Date(usage.timestamp).toLocaleDateString()}</td>
                <td>{new Date(usage.timestamp).toLocaleTimeString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                No usage records found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
}

export default UserUsage;
