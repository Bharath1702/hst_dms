// client/src/UserTable.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, OverlayTrigger, Tooltip, Container } from 'react-bootstrap';
import { QRCodeCanvas } from 'qrcode.react';
import { Link } from 'react-router-dom';
import { toPng } from 'html-to-image';
import download from 'downloadjs';

function UserTable() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch all users from backend
    axios
      .get('http://localhost:5000/api/allUsers')
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error('Error fetching users from backend:', error);
      });
  }, []);

  const handleDownloadQR = (indId, index) => {
    const qrCodeElement = document.getElementById(`qr-code-${index}`);
    toPng(qrCodeElement)
      .then((dataUrl) => {
        download(dataUrl, `${indId}_QRCode.png`);
      })
      .catch((error) => {
        console.error('Error generating QR code image:', error);
      });
  };

  const truncateText = (text, maxLength = 20) => {
    if (text && text.length > maxLength) {
      return text.slice(0, maxLength) + '...';
    }
    return text;
  };

  const renderTooltip = (text) => <Tooltip>{text}</Tooltip>;

  return (
    <Container className="mt-5">
      <h1 className="text-center">User Data</h1>
      <Table striped bordered hover responsive className="mt-4">
        <thead>
          <tr>
            <th>IND_ID</th>
            <th>Full Name</th>
            <th>Event</th>
            <th>State</th>
            <th>Org</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Bio</th>
            <th>Pic</th>
            <th>QR Code Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user.IND_ID}>
              <td title={user.IND_ID}>{truncateText(user.IND_ID)}</td>
              <td title={user.FullName}>{truncateText(user.FullName)}</td>
              <td title={user.Event}>{truncateText(user.Event)}</td>
              <td title={user.State}>{truncateText(user.State)}</td>
              <td title={user.Org}>{truncateText(user.Org)}</td>
              <td title={user.Phone}>{truncateText(user.Phone)}</td>
              <td title={user.Email}>{truncateText(user.Email)}</td>
              <td title={user.Bio}>{truncateText(user.Bio)}</td>
              <td title={user.Pic}>
                {user.Pic ? (
                  <img src={user.Pic} alt="Profile" width="50" height="50" />
                ) : (
                  'N/A'
                )}
              </td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div id={`qr-code-${index}`}>
                    <QRCodeCanvas
                      value={`http://localhost:3000/user/${user.IND_ID}`}
                      size={128}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <OverlayTrigger
                    placement="top"
                    overlay={renderTooltip(`View details of ${user.FullName}`)}
                  >
                    <Button
                      variant="primary"
                      size="sm"
                      className="mt-2"
                      as={Link}
                      to={`/user/${user.IND_ID}`}
                      style={{ width: '100%' }}
                    >
                      View Details
                    </Button>
                  </OverlayTrigger>
                  <OverlayTrigger
                    placement="top"
                    overlay={renderTooltip('Download QR Code')}
                  >
                    <Button
                      variant="success"
                      size="sm"
                      className="mt-2"
                      onClick={() => handleDownloadQR(user.IND_ID, index)}
                      style={{ width: '100%' }}
                    >
                      Download QR
                    </Button>
                  </OverlayTrigger>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default UserTable;
