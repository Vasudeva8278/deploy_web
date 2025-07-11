import React, { useState, useEffect } from "react";
import axios from "axios";
import DocumentView from "./DocumentView";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/solid";
import { useLocation, useParams } from "react-router-dom";
import {  getDocumentsListByTemplateId } from "../../services/documentApi";

function DocumentContainer() {
  const [documents, setDocuments] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { id } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const projectId = queryParams.get('projectId');

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await getDocumentsListByTemplateId(projectId,id);
        const templateName = response?.templateName;
        const data = response?.documents;
        setDocuments(data);
      } catch (error) {
        console.error("Failed to fetch documents", error);
      }
    };

    fetchDocuments();
  }, [id]);

  const handleNext = () => {
    if (currentIndex < documents.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleBack = () => {
    // Handle navigation back to a previous route or view
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <button
          className={`border px-4 py-2 rounded ${currentIndex === 0 ? 'border-gray-400 text-gray-400' : 'border-blue-600 text-blue-600 hover:bg-blue-100'}`}
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ArrowLeftIcon className="w-5 h-5 inline-block mr-2" /> Previous
        </button>
        <span className="text-gray-600">{currentIndex + 1} / {documents.length}</span>
        <button
          className={`border px-4 py-2 rounded ${currentIndex === documents.length - 1 ? 'border-gray-400 text-gray-400' : 'border-blue-600 text-blue-600 hover:bg-blue-100'}`}
          onClick={handleNext}
          disabled={currentIndex === documents.length - 1}
        >
          Next <ArrowRightIcon className="w-5 h-5 inline-block ml-2" />
        </button>
      </div>

      {documents.length > 0 && (
        <DocumentView id={documents[currentIndex]._id} templateId={id}/>
      )}
    </div>
  );
}

export default DocumentContainer;
