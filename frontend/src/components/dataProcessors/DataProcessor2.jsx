import React, { useState, useEffect } from 'react';
import { TextInput, Button, Spinner, Table, Modal } from 'flowbite-react';
import { FaUpload } from 'react-icons/fa';
import Cookies from "js-cookie";
import { jwtDecode } from 'jwt-decode';

function DataProcessor2() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [userEmail, setUserEmail] = useState();

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Upload file to S3 and notify backend
  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Generate a unique file name with folder structure
      const fileName = `uploads/data_processing2/${Date.now()}_${file.name}`;

      // Step 1: Request a pre-signed URL from the backend
      const preSignedResponse = await fetch(
        'https://pg70ny2xv0.execute-api.us-east-1.amazonaws.com/dev/presignedUrl', // Replace with your API Gateway endpoint for pre-signed URL
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

      // Step 3: Notify the backend Lambda function
      const backendResponse = await fetch(
        'https://pg70ny2xv0.execute-api.us-east-1.amazonaws.com/dev/triggerProcess', // Replace with your API Gateway endpoint for notifying Lambda
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file_key: fileName,
            choice: '2', // Replace with your actual processing choice
            email: userEmail,
          }),
        }
      );

      if (!backendResponse.ok) {
        throw new Error('Failed to notify backend.');
      }

      console.log('Backend notified successfully.');
      setTimeout(fetchResults(userEmail), 3000);
    } catch (err) {
      console.error('Error:', err.message);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // Fetch processing results
  const fetchResults = async (email) => {
    try {
      const response = await fetch(
        'https://pg70ny2xv0.execute-api.us-east-1.amazonaws.com/dev/getResults', // Replace with your API Gateway endpoint for fetching results
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email, choice: '2' }),
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

  // Open modal to show selected result
  const handleViewResult = (result) => {
    setSelectedResult(result);
    setModalIsOpen(true);
  };



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

  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Upload Section */}
      <div className="p-4 flex justify-between items-center bg-gray-100 shadow-md">
        <div className="font-semibold text-2xl text-gray-900 italic">Data Processor 2</div>
        <div className="flex items-center">
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
            <Table.HeadCell>Status</Table.HeadCell>
            <Table.HeadCell>Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {results.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={4} className="text-center">
                  No results available. Upload a file to start processing.
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
                    <span
                      className={`px-2 py-1 rounded ${result.stat === 'Completed'
                        ? 'bg-green-200 text-green-800'
                        : 'bg-yellow-200 text-yellow-800'
                        }`}
                    >
                      {result.stat}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <Button
                      color="info"
                      onClick={() => handleViewResult(result)}
                      className="bg-blue-500 text-white hover:bg-blue-700"
                    >
                      View Output
                    </Button>
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

export default DataProcessor2;
