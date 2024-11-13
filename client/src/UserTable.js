import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table,
  Button,
  OverlayTrigger,
  Tooltip,
  Container,
  Spinner,
  ProgressBar,
} from 'react-bootstrap';
import { QRCodeCanvas } from 'qrcode.react';
import { Link } from 'react-router-dom';
import download from 'downloadjs';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { zipSync, strToU8 } from 'fflate'; // Import fflate

function UserTable() {
  const [users, setUsers] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [isDownloadingZIP, setIsDownloadingZIP] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsSyncing(true);
        // Fetch and sync data from backend
        await axios.get('https://hst-dms.vercel.app/api/fetch-sheetdb-data');
        // Fetch users data
        const response = await axios.get('https://hst-dms.vercel.app/api/allUsers');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users from backend:', error);
      } finally {
        setIsSyncing(false);
      }
    };

    fetchData();
  }, []);

  const handleDownloadQR = (indId, index) => {
    const qrCodeElement = document.getElementById(`qr-code-container-${index}`);
    if (!qrCodeElement) {
      console.error(`QR code element not found for index ${index}`);
      return;
    }
    // Use html-to-image to generate the QR code image
    import('html-to-image').then(({ toPng }) => {
      toPng(qrCodeElement)
        .then((dataUrl) => {
          download(dataUrl, `${indId}_QRCode.png`);
        })
        .catch((error) => {
          console.error('Error generating QR code image:', error);
        });
    });
  };

  const handleDownloadAllQRsPDF = async () => {
    try {
      setIsDownloadingAll(true);
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const marginX = 10;
      const marginY = 10;
      const qrSize = 40;
      const spacingX = 10;
      const spacingY = 20;
      const itemsPerRow = Math.floor((pageWidth - 2 * marginX + spacingX) / (qrSize + spacingX));
      const itemsPerColumn = Math.floor((pageHeight - 2 * marginY) / (qrSize + spacingY));
      const itemsPerPage = itemsPerRow * itemsPerColumn;

      const promises = users.map(async (user) => {
        const qrValue = `https://hst-dms-frontend.vercel.app/user/${user.IND_ID}`;
        const url = await QRCode.toDataURL(qrValue, { width: 128, margin: 1 });
        return { url, user };
      });

      const results = await Promise.all(promises);

      for (let i = 0; i < results.length; i++) {
        const { url, user } = results[i];
        const pageIndex = Math.floor(i / itemsPerPage);
        const itemIndex = i % itemsPerPage;

        if (i > 0 && itemIndex === 0) {
          doc.addPage();
        }

        const row = Math.floor(itemIndex / itemsPerRow);
        const col = itemIndex % itemsPerRow;
        const x = marginX + col * (qrSize + spacingX);
        const y = marginY + row * (qrSize + spacingY);

        doc.addImage(url, 'PNG', x, y, qrSize, qrSize);
        doc.setFontSize(10);
        doc.text(user.IND_ID, x + qrSize / 2, y + qrSize + 5, { align: 'center' });
      }

      doc.save('All_QRCodes.pdf');
    } catch (error) {
      console.error('Error generating all QR codes PDF:', error);
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const handleDownloadAllQRsZIP = async () => {
    try {
      setIsDownloadingZIP(true);
      setDownloadProgress(0);

      const zipFiles = {};

      const total = users.length;
      let processed = 0;

      // Process all users and add to zipFiles object
      const promises = users.map(async (user) => {
        try {
          const qrValue = `https://hst-dms-frontend.vercel.app/user/${user.IND_ID}`;
          const qrDataUrl = await QRCode.toDataURL(qrValue, { width: 128, margin: 1 });
          const base64Data = qrDataUrl.split(',')[1];
          // Convert base64 to Uint8Array
          const binaryStr = atob(base64Data);
          const binaryLen = binaryStr.length;
          const bytes = new Uint8Array(binaryLen);
          for (let j = 0; j < binaryLen; j++) {
            bytes[j] = binaryStr.charCodeAt(j);
          }
          zipFiles[`${user.IND_ID}.png`] = bytes;
        } catch (error) {
          console.error(`Error generating QR for ${user.IND_ID}:`, error);
        } finally {
          processed += 1;
          setDownloadProgress((processed / total) * 100);
        }
      });

      await Promise.all(promises);

      // Use fflate's zipSync for faster ZIP creation
      const zippedData = zipSync(zipFiles, { level: 9 });
      const blob = new Blob([zippedData], { type: 'application/zip' });
      download(blob, 'All_QRCodes.zip');
    } catch (error) {
      console.error('Error generating all QR codes ZIP:', error);
    } finally {
      setIsDownloadingZIP(false);
      setDownloadProgress(0);
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
        <div>
          <Button
            variant="success"
            onClick={handleDownloadAllQRsPDF}
            disabled={users.length === 0 || isDownloadingAll}
            className="me-2"
          >
            {isDownloadingAll ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Downloading PDF...
              </>
            ) : (
              'Download All QR Codes (PDF)'
            )}
          </Button>
          <Button
            variant="primary"
            onClick={handleDownloadAllQRsZIP}
            disabled={users.length === 0 || isDownloadingZIP}
          >
            {isDownloadingZIP ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Downloading ZIP...
              </>
            ) : (
              'Download All QR Codes (ZIP)'
            )}
          </Button>
        </div>
      </div>
      {isDownloadingZIP && (
        <div className="mt-3">
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
            className="me-2"
          />
          Downloading ZIP... {Math.round(downloadProgress)}%
          <ProgressBar now={downloadProgress} label={`${Math.round(downloadProgress)}%`} className="mt-2" />
        </div>
      )}
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
                        transform: 'translateX(-50%)',
                        color: 'black',
                        padding: '2px 5px',
                        borderRadius: '5px',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
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
