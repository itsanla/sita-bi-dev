'use client';
import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

export default function ImportPage() {
    const { user } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [type, setType] = useState<'mahasiswa' | 'dosen'>('mahasiswa');
    const [preview, setPreview] = useState<any | null>(null);
    const [importResult, setImportResult] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
            setPreview(null);
            setImportResult(null);
        }
    };

    const handleValidate = async () => {
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
            const res = await fetch(`${API_URL}/api/import/validate/${type}`, {
                method: 'POST',
                headers: {
                   'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            const data = await res.json();
            if (data.status === 'sukses') {
                setPreview(data.data);
                setStep(2);
            } else {
                alert(data.message);
            }
        } catch (e) {
            alert('Error validating file');
        } finally {
            setLoading(false);
        }
    };

    const handleExecute = async () => {
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
             const token = localStorage.getItem('token');
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
            const res = await fetch(`${API_URL}/api/import/execute/${type}`, {
                method: 'POST',
                headers: {
                   'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            const data = await res.json();
            setImportResult(data.data);
            setStep(3);
        } catch (e) {
            alert('Error executing import');
        } finally {
            setLoading(false);
        }
    };

    const downloadTemplate = () => {
        let content = '';
        if (type === 'mahasiswa') {
            content = 'nim,nama,email,prodi,kelas\n12345,John Doe,john@example.com,D4,4A';
        } else {
            content = 'nidn,nama,email,prodi\n99999,Dr. Jane,jane@example.com,D4';
        }
        const blob = new Blob([content], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `template_${type}.csv`;
        a.click();
    };

    if (!user || !user.roles?.some(r => r.name === 'admin')) {
        return <div className="p-8">Access Denied</div>;
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Bulk Import Users</h1>

            <div className="mb-8">
                <div className="flex gap-4 mb-4">
                    <button
                        onClick={() => { setType('mahasiswa'); setStep(1); setPreview(null); }}
                        className={`px-4 py-2 rounded ${type === 'mahasiswa' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    >
                        Mahasiswa
                    </button>
                    <button
                        onClick={() => { setType('dosen'); setStep(1); setPreview(null); }}
                        className={`px-4 py-2 rounded ${type === 'dosen' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    >
                        Dosen
                    </button>
                </div>

                {step === 1 && (
                    <div className="bg-white p-6 rounded shadow">
                        <h2 className="text-xl font-bold mb-4">Step 1: Upload CSV</h2>
                        <div className="mb-4">
                            <button onClick={downloadTemplate} className="text-blue-600 underline text-sm">Download Template CSV</button>
                        </div>
                        <input type="file" accept=".csv" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        <button
                            onClick={handleValidate}
                            disabled={!file || loading}
                            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                        >
                            {loading ? 'Validating...' : 'Validate & Preview'}
                        </button>
                    </div>
                )}

                {step === 2 && preview && (
                    <div className="bg-white p-6 rounded shadow">
                         <h2 className="text-xl font-bold mb-4">Step 2: Preview Validation</h2>
                         <div className="flex gap-4 mb-4 text-sm">
                             <div className="bg-green-100 text-green-800 px-3 py-1 rounded">Valid: {preview.valid}</div>
                             <div className="bg-red-100 text-red-800 px-3 py-1 rounded">Invalid: {preview.invalid}</div>
                         </div>

                         {preview.errors.length > 0 && (
                             <div className="mb-4 max-h-60 overflow-y-auto border p-2 rounded bg-red-50">
                                 <h3 className="font-bold text-red-700">Errors:</h3>
                                 <ul className="list-disc pl-5 text-sm text-red-600">
                                     {preview.errors.map((err: any, idx: number) => (
                                         <li key={idx}>Row {err.row}: {err.messages.join(', ')}</li>
                                     ))}
                                 </ul>
                             </div>
                         )}

                        <div className="flex gap-4">
                            <button onClick={() => setStep(1)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
                            <button
                                onClick={handleExecute}
                                disabled={loading}
                                className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
                            >
                                {loading ? 'Importing...' : 'Execute Import'}
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && importResult && (
                    <div className="bg-white p-6 rounded shadow">
                        <h2 className="text-xl font-bold mb-4">Import Complete</h2>
                         <div className="mb-4">
                             <p>Total Processed: {importResult.total}</p>
                             <p className="text-green-600">Success: {importResult.success}</p>
                             <p className="text-red-600">Failed: {importResult.failed}</p>
                         </div>
                         {importResult.errors.length > 0 && (
                             <div className="max-h-60 overflow-y-auto border p-2 rounded bg-red-50">
                                 <h3 className="font-bold text-red-700">Failed Rows:</h3>
                                 <ul className="list-disc pl-5 text-sm text-red-600">
                                     {importResult.errors.map((err: any, idx: number) => (
                                         <li key={idx}>Row {err.row}: {err.error}</li>
                                     ))}
                                 </ul>
                             </div>
                         )}
                         <button onClick={() => { setStep(1); setFile(null); }} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Import More</button>
                    </div>
                )}
            </div>
        </div>
    );
}
