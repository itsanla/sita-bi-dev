"use client";

import { useState, FormEvent } from 'react';
import api from '@/lib/api';

interface UploadResponse {
  signedUrl: string;
  originalUrl: string;
  [key: string]: any;
}

export default function TestUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<UploadResponse | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await api<{ data: UploadResponse }>('/test-upload', {
        method: 'POST',
        body: formData,
      });
      setResponse(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred during upload.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Test S3 Upload</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
              Choose a file to upload
            </label>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !file}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg disabled:bg-blue-300"
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </form>

        {error && (
          <div className="mt-4 bg-red-100 text-red-700 p-3 rounded">
            <p><strong>Error:</strong> {error}</p>
          </div>
        )}

        {response && (
          <div className="mt-4 bg-green-100 text-green-700 p-3 rounded">
            <p><strong>Upload Successful!</strong></p>
            <div className="mt-2 text-sm">
              <p><strong>Signed URL (expires in 15 mins):</strong></p>
              <a href={response.signedUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 break-all">{response.signedUrl}</a>
              <p className="mt-2"><strong>Original S3 URL:</strong></p>
              <a href={response.originalUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 break-all">{response.originalUrl}</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}