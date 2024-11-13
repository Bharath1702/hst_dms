// frontend/src/components/UserDetails.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Card, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import './UserDetails.css';

function UserDetails() {
  const { indId } = useParams();
  const [user, setUser] = useState(null);
  const [scanFeedback, setScanFeedback] = useState(null);

  useEffect(() => {
    axios
      .get(`https://hst-dms.vercel.app/api/user/${indId}`)
      .then((response) => {
        setUser(response.data);
      })
      .catch((error) => {
        console.error('Error fetching user details:', error);
      });

    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const message = params.get('message');
    if (status && message) {
      setScanFeedback({ status, message });
    }
  }, [indId]);

  const handleSaveContact = () => {
    if (!user) return;

    const fullName = user.FullName || user['Full Name'] || 'Unknown Name';

    const vCardData = `
BEGIN:VCARD
VERSION:3.0
FN:${fullName}
EMAIL;TYPE=INTERNET:${user.Email || ''}
TEL;TYPE=CELL:${user.Phone || ''}
END:VCARD
    `.trim();

    const blob = new Blob([vCardData], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${fullName.replace(/\s+/g, '_')}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  if (!user) {
    return <h1 className="loading">Loading...</h1>;
  }

  const profileImage ='https://iitmandicatalyst.in/hst2024/images/logo.png'

  const fullName = user.FullName || user['Full Name'] || 'No Name Provided';

  return (
    <div className="user-details">
      <Container className="mt-5">
        {scanFeedback && (
          <Alert
            variant={
              scanFeedback.status === 'green'
                ? 'success'
                : scanFeedback.status === 'already_collected'
                ? 'warning'
                : 'danger'
            }
            onClose={() => setScanFeedback(null)}
            dismissible
          >
            {scanFeedback.message}
          </Alert>
        )}
        <Card className="profile-card text-center">
          <div className="profile-image-container">
            <Card.Img
              variant="top"
              src={profileImage}
              alt="Profile Picture"
              className="profile-image"
            />
          </div>
          <Card.Body>
            <Card.Title>{fullName}</Card.Title>
            <Card.Text>
              <strong>Event:</strong> {user.Event}
            </Card.Text>
            <Card.Text>
              <strong>State:</strong> {user.State}
            </Card.Text>
            <Card.Text>
              <strong>Org:</strong> {user.Org}
            </Card.Text>
            <Card.Text>
              <strong>Phone:</strong> {user.Phone}
            </Card.Text>
            <Card.Text>
              <strong>Email:</strong> {user.Email}
            </Card.Text>
            <Card.Text>
              <strong>Bio:</strong> {user.Bio}
            </Card.Text>
            <Button variant="primary" onClick={handleSaveContact}>
              Save Contact
            </Button>
            <center color='white'>
              powered by <a href="https://blueticksinnovations.com">Blueticks Innovations Private Limited</a>
            </center>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default UserDetails;
