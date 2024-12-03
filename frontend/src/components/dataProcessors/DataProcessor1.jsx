import React, { useState, useEffect } from 'react';
import { Button, Spinner, Table } from 'flowbite-react';
import { FaUpload } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import Cookies from "js-cookie";

function DataProcessor1() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const token = Cookies.get("jwtToken");
      const decoded = await jwtDecode(token);
      setUserEmail(decoded?.email || null);
      console.log("Decoded Token:", decoded.email);
      fetchResults(decoded.email );

    }

    fetchData();

  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    if (!isAuthenticated) {
      const storedProcessIDs = JSON.parse(localStorage.getItem('processIDs') || '[]');
      console.log(storedProcessIDs)
      if (storedProcessIDs.length >= 2) {
        toast.error("You have exhausted your attempts. Log in for more attempts and to view results.");
        return;
      }
    }

    setUploading(true);
    setError(null);

    try {
      const fileName = `uploads/data_processing1/${Date.now()}_${file.name}`;

      // Step 1: Get Pre-Signed URL
      const preSignedResponse = await fetch(
        'https://pg70ny2xv0.execute-api.us-east-1.amazonaws.com/dev/presignedUrl',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file_name: fileName,
            file_type: file.type,
          }),
        }
      );

      if (!preSignedResponse.ok) {
        throw new Error('Failed to get pre-signed URL.');
      }

      const responseBody = await preSignedResponse.json();
      const uploadUrl = responseBody.url;

      // Step 2: Upload file to S3
      await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      console.log('File uploaded to S3 successfully.');

      // Step 3: Notify Backend
      const backendResponse = await fetch(
        'https://pg70ny2xv0.execute-api.us-east-1.amazonaws.com/dev/triggerProcess',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file_key: fileName,
            choice: '1',
            email: userEmail || 'guest',
          }),
        }
      );

      if (!backendResponse.ok) {
        throw new Error('Failed to notify backend.');
      }

      const backendData = await backendResponse.json();
      console.log('Backend notified successfully.');

      // Store Process ID in LocalStorage if user is not logged in
      if (!isAuthenticated) {
        const processIDs = JSON.parse(localStorage.getItem('processIDs') || '[]');
        processIDs.push(backendData.ProcessID);
        localStorage.setItem('processIDs', JSON.stringify(processIDs));
      }

      if (isAuthenticated) setTimeout(fetchResults(userEmail), 3000);
    } catch (err) {
      console.error('Error:', err.message);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const fetchResults = async (email) => {


    try {
      const response = await fetch(
        'https://pg70ny2xv0.execute-api.us-east-1.amazonaws.com/dev/getResults',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email, choice: '1' }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch results.');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error('Error fetching results:', err.message);
      setError(err.message);
    }
  };

  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div className="p-4 flex justify-between items-center bg-gray-100 shadow-md">
        <div className="font-semibold text-2xl text-gray-900 italic">Data Processor 1</div>
        <div className="flex items-center">
          <ToastContainer position="top-right" autoClose={3000} />
          <input
            type="file"
            accept="application/json"
            onChange={handleFileChange}
            className="mr-2"
          />
          <Button
            onClick={handleUpload}
            color="dark"
            className="bg-black text-white hover:bg-gray-800 flex items-center"
          >
            {uploading ? <Spinner size="sm" /> : <FaUpload className="mr-2" />}
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </div>

      {/* Results Table */}
      <div className="flex-1 overflow-y-auto p-4 bg-white">
        {error && (
          <div className="text-red-600 text-center mb-4">
            Error: {error}
          </div>
        )}

        <Table hoverable={true}>
          <Table.Head>
            <Table.HeadCell>Process ID</Table.HeadCell>
            <Table.HeadCell>Input File</Table.HeadCell>
            <Table.HeadCell>Output File</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {results.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={4} className="text-center">
                  {isAuthenticated ? 'No results available. Upload a file to start processing.' : 'Log in to view results'}
                </Table.Cell>
              </Table.Row>
            ) : (
              results.map((result) => (
                <Table.Row key={result.ProcessID}>
                  <Table.Cell>{result.ProcessID}</Table.Cell>
                  <Table.Cell>
                    <a
                      href={`https://dataprocessorinputdal1.s3.us-east-1.amazonaws.com/${result.FileKey}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      Download Input
                    </a>
                  </Table.Cell>
                  <Table.Cell>
                    <a
                      href={result.ResultKey}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      Download Output
                    </a>
                  </Table.Cell>
                  <Table.Cell>
                    <span
                      className={`px-2 py-1 rounded ${result.stat === 'Completed'
                        ? 'bg-green-200 text-green-800'
                        : 'bg-yellow-200 text-yellow-800'
                        }`}
                    >
                      {result.stat}
                    </span>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}

export default DataProcessor1;
