import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table,
  Button,
  OverlayTrigger,
  Tooltip,
  Container,
} from 'react-bootstrap';
import { QRCodeCanvas } from 'qrcode.react';
import { Link } from 'react-router-dom';
import { toPng } from 'html-to-image';
import download from 'downloadjs';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

function UserTable() {
  const [users, setUsers] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Fetch and sync data from backend
    const fetchData = async () => {
      try {
        // Call backend endpoint to fetch and sync data from SheetDB
        await axios.get('https://hst-dms.vercel.app/api/fetch-sheetdb-data');

        // After sync, fetch users data
        const response = await axios.get('https://hst-dms.vercel.app/api/allUsers');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users from backend:', error);
      }
    };

    fetchData();
  }, []);

  const handleDownloadQR = (indId, index) => {
    const qrCodeElement = document.getElementById(`qr-code-container-${index}`);
    toPng(qrCodeElement)
      .then((dataUrl) => {
        download(dataUrl, `${indId}_QRCode.png`);
      })
      .catch((error) => {
        console.error('Error generating QR code image:', error);
      });
  };

  const handleDownloadAllQRs = async () => {
    try {
      const doc = new jsPDF();
      const promises = users.map(async (user) => {
        const qrValue = `https://hst-dms-frontend.vercel.app/user/${user.IND_ID}`;
        const url = await QRCode.toDataURL(qrValue, {
          width: 128,
          margin: 1,
        });
        return { url, user };
      });

      const results = await Promise.all(promises);

      let x = 10;
      let y = 10;
      const qrSize = 40; // Adjust size as needed
      const itemsPerRow = 4;

      results.forEach((result, idx) => {
        const { url, user } = result;
        doc.addImage(url, 'PNG', x, y, qrSize, qrSize);
        // Add the IND_ID below the QR code
        doc.setFontSize(10);
        doc.text(
          user.IND_ID,
          x + qrSize / 2,
          y + qrSize + 5,
          { align: 'center' }
        );
        x += qrSize + 10;
        if ((idx + 1) % itemsPerRow === 0) {
          x = 10;
          y += qrSize + 20; // Adjust spacing as needed
        }
      });

      doc.save('All_QRCodes.pdf');
    } catch (error) {
      console.error('Error generating all QR codes:', error);
    }
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1>User Data</h1>
        <Button
          variant="success"
          onClick={handleDownloadAllQRs}
          disabled={users.length === 0}
        >
          Download All QR Codes
        </Button>
      </div>
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
                  <img
                    src={user.Pic}
                    alt="Profile"
                    width="50"
                    height="50"
                  />
                ) : (
                  'N/A'
                )}
              </td>
              <td>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  {/* QR Code Container */}
                  <div
                    id={`qr-code-container-${index}`}
                    style={{
                      position: 'relative',
                      width: '128px',
                      height: '128px',
                      marginBottom: '10px',
                    }}
                  >
                    {/* QR Code */}
                    <QRCodeCanvas
                      value={`https://hst-dms-frontend.vercel.app/user/${user.IND_ID}`}
                      size={128}
                      level="H"
                      includeMargin={true}
                    />
                    {/* Overlay Text */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '5px',
                        left: '50%',
                        top: '84%',
                        transform: 'translateX(-50%)',
                        color: 'black',
                        padding: '2px 5px',
                        borderRadius: '5px',
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 'bold',
                          fontSize: '12px',
                        }}
                      >
                        {user.IND_ID}
                      </span>
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <OverlayTrigger
                    placement="top"
                    overlay={renderTooltip(
                      `View details of ${user.FullName}`
                    )}
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
                      onClick={() =>
                        handleDownloadQR(user.IND_ID, index)
                      }
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
