import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TemplateCards from "./Template/TemplateCards";
import { deleteTemplateById, getTemplates } from "../services/templateApi";

const Homepage = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await getTemplates();
        /*  if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        } */
        const data = response; //await response.json();
        setDocuments(data.slice(0, 5));
      } catch (error) {
        setError("Failed to fetch documents");
        console.error("Failed to fetch documents", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleDelete = async (docId) => {
    try {
      const response = await deleteTemplateById(docId);

      if (response.ok) {
        setDocuments(documents.filter((doc) => doc._id !== docId));
      } else {
        console.error("Failed to delete document");
      }
    } catch (error) {
      console.error("An error occurred during deletion:", error);
    }
  };

  return (
    <main className='container mx-auto px-4 py-8'>
      <div className='text-center mt-10'>
        <h1 className='text-4xl font-bold'>
          GENERATE <span className='text-indigo-600'>DOCUMENTS</span> WITH EASE{" "}
          <span className='text-indigo-600'>!!</span>
        </h1>
        <p className='text-lg font-light mt-3'>
          ********** helps you create, comprehend and replicate documents to
          share or print.
        </p>
      </div>
      <div className='flex justify-center mt-10'>
        <button
          className='w-60 h-10 bg-indigo-600 text-white rounded-lg mx-2'
          onClick={() => navigate("/Neo")}
        >
          Start Creating Template
        </button>
      </div>
      <div className='flex  mt-4 ml-4 w-full'>
        <div className='flex m-4 w-full justify-center'>
          <TemplateCards
            documents={documents}
            handleDeleteTemplate={handleDelete}
          />
        </div>
      </div>
      <h2 className='text-2xl font-bold text-center mb-8'>
        A perfect fit for everyone
      </h2>
      <div className='grid grid-cols-3 gap-8'>
        <div className='bg-white p-6 rounded-lg shadow text-center'>
          <h3 className='text-xl font-bold mb-4'>Free</h3>
          <p className='text-3xl font-bold mb-4'>$0.00</p>
          <p className='text-sm text-gray-600'>
            For anyone to create and generate multiple documents, whether
            personal or for their clients or for their friends.
          </p>
        </div>
        <div className='bg-gradient-to-r from-gray-200 to-gray-400 p-6 rounded-lg shadow text-center'>
          <h3 className='text-xl font-bold mb-4'>Enterprise</h3>
          <p className='text-3xl font-bold mb-4'>
            $10.00<span className='text-sm font-normal'>/month</span>
          </p>
          <p className='text-sm text-gray-600'>
            Collaborate with your friends and team to create documents with
            ease.
          </p>
        </div>
        <div className='bg-gradient-to-r from-yellow-200 to-yellow-400 p-6 rounded-lg shadow text-center'>
          <h3 className='text-xl font-bold mb-4'>Teams</h3>
          <p className='text-3xl font-bold mb-4'>
            $20.00<span className='text-sm font-normal'>/month</span>
          </p>
          <p className='text-sm text-gray-600'>
            All the great features of teams and more to collaborate and maintain
            documents from a small business to a business of any size.
          </p>
        </div>
      </div>
    </main>
  );
};

export default Homepage;
