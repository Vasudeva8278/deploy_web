import React, { useState, useEffect } from 'react';
import { TrashIcon, DocumentTextIcon, ArrowCircleDownIcon } from '@heroicons/react/outline';
import { deleteTemplateById, getTemplates } from '../../services/templateApi';

const DocumentList = ({ onSelectDocument, onExport }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await getTemplates();
        const data = response;
        setDocuments(data);
      } catch (error) {
        setError('Failed to fetch documents');
        console.error('Failed to fetch documents', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const handleDeleteDocument = async (docId) => {
    try {
      const response = await deleteTemplateById(docId)
      if (response) {
        setDocuments((prevDocuments) => prevDocuments.filter((doc) => doc._id !== docId));
        alert('Document deleted successfully');
      } else {
        throw new Error(`Failed to delete document. `);
      }
    } catch (error) {
      setError('Failed to delete document');
      console.error('Failed to delete document', error);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="w-full p-4">
      <table className="min-w-full bg-white shadow-md rounded-lg">
        <thead>
          <tr className="bg-blue-100 text-gray-700">
            <th className="py-2 px-4 border">Document</th>
            <th className="py-2 px-4 border">Labels</th>
            <th className="py-2 px-4 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc._id} className="hover:bg-gray-100">
              <td className="py-2 px-4 border">{doc.fileName}</td>
              <td className="py-2 px-4 border text-center">{doc.highlights.length}</td>
              <td className="py-2 px-4 border">
              <button
                  onClick={() => onExport(doc._id)}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors inline-flex items-center"
                >
                  <ArrowCircleDownIcon className="w-5 h-5 mr-1" /> Export
                </button>
                <button
                  onClick={() => onSelectDocument(doc._id)}
                  className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors inline-flex items-center"
                >
                  <DocumentTextIcon className="w-5 h-5 mr-1" /> Open
                </button>
                <button
                  onClick={() => handleDeleteDocument(doc._id)}
                  className="ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors inline-flex items-center"
                >
                  <TrashIcon className="w-5 h-5 mr-1" /> Delete
                </button>
               
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DocumentList;
