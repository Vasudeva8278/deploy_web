import React, { useEffect, useState } from 'react';
import HighlightTable from '../../pages/HighlightTable';
import { useLocation, useParams } from 'react-router-dom';
import { getTemplatesById } from '../../services/templateApi';


const ExportComponent = () => {
  const { id } = useParams();
  const [highlightsArray, setHighlightsArray] = useState([]);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation(); // Gives you access to the current URL including the query string
  const queryParams = new URLSearchParams(location.search);
  const projectId = queryParams.get('projectId');


  useEffect(() => {
    const fetchDocument = async () => {
      if (id) {
        try {
          const response = await getTemplatesById(projectId,id);
          const result = response;
          let arrayData = [];
          arrayData.push(result.highlights);
          setHighlightsArray(arrayData);
          setFileName(result.fileName);
        } catch (error) {
          setError('Failed to fetch document');
          console.error('Failed to fetch document', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDocument();
  }, [id]);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-2">
     
      {highlightsArray.length > 0 && (
        <HighlightTable highlightsArray={highlightsArray} templateId={id}  filename={fileName}/>
      ) }
    
    </div>
  );
};

export default ExportComponent;
