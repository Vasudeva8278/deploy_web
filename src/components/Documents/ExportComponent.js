import React, { useEffect, useState, useCallback } from 'react';
import HighlightTable from '../../pages/HighlightTable';
import { useLocation, useParams } from 'react-router-dom';
import { getTemplatesById } from '../../services/templateApi';
import { updateDocHighlightText, exportDocument, generateZipFile } from '../../services/documentApi';

const ExportComponent = () => {
  const { id } = useParams();
  const [highlightsArray, setHighlightsArray] = useState([]);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [documentChanges, setDocumentChanges] = useState({});
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const location = useLocation(); // Gives you access to the current URL including the query string
  const queryParams = new URLSearchParams(location.search);
  const projectId = queryParams.get('projectId');

  // Memoized fetch document function with better error handling
  const fetchDocument = useCallback(async () => {
    if (!id) {
      setError('Template ID is required');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      console.log("Fetching template data for ID:", id);
      const response = await getTemplatesById(projectId, id);
      const result = response;
      
      console.log("Template data received:", result);
      console.log("Template highlights:", result.highlights);
      
      // Process all highlights from the template
      let processedHighlights = [];
      
      if (result.highlights && Array.isArray(result.highlights)) {
        // Process each highlight to ensure all properties are present
        processedHighlights = result.highlights.map((highlight, index) => {
          console.log(`Processing highlight ${index}:`, highlight);
          
          // Ensure all required properties are present
          const processedHighlight = {
            id: highlight.id || highlight._id || `highlight-${index}`,
            label: highlight.label || highlight.name || `Field_${index + 1}`,
            text: highlight.text || '',
            type: highlight.type || 'text',
            name: highlight.name || highlight.label || highlight.id || `Field_${index + 1}`,
            multi: highlight.multi || false,
            editable: true // Mark as editable for real-time changes
          };
          
          console.log(`Processed highlight ${index}:`, processedHighlight);
          return processedHighlight;
        });
      }
      
      console.log("Final processed highlights:", processedHighlights);
      
      // Set the highlights array - no need to wrap in another array
      setHighlightsArray(processedHighlights);
      setFileName(result.fileName);
      
      console.log("Highlights array set:", processedHighlights);
      console.log("File name set:", result.fileName);
      
    } catch (error) {
      console.error("Failed to fetch document:", error);
      setError('Failed to fetch document. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [id, projectId]);

  // Handle real-time changes to highlight values
  const handleHighlightChange = useCallback((highlightId, newValue) => {
    console.log(`Updating highlight ${highlightId} with value:`, newValue);
    
    setDocumentChanges(prev => ({
      ...prev,
      [highlightId]: newValue
    }));
    
    // Update the highlights array with the new value
    setHighlightsArray(prev => 
      prev.map(highlight => 
        highlight.id === highlightId 
          ? { ...highlight, text: newValue }
          : highlight
      )
    );
  }, []);

  // Generate document with applied changes
  const handleGenerateDocumentWithChanges = useCallback(async () => {
    if (!highlightsArray || highlightsArray.length === 0) {
      setError("No highlights to generate document from");
      return;
    }

    try {
      setIsGenerating(true);
      setGenerationProgress(0);
      setError(null);
      setShowGenerationModal(true);

      // Create a document object with current highlights and changes
      const documentWithChanges = {
        id: `temp-${Date.now()}`,
        templateId: id,
        fileName: fileName || "Generated Document",
        highlights: highlightsArray.map(highlight => ({
          ...highlight,
          text: documentChanges[highlight.id] || highlight.text || ''
        }))
      };

      console.log("Generating document with changes:", documentWithChanges);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Update document in backend if it exists, otherwise create new
      let documentId = documentWithChanges.id;
      
      try {
        // Try to update existing document
        const updateResult = await updateDocHighlightText(documentId, documentWithChanges);
        if (updateResult) {
          console.log("Document updated successfully");
        }
      } catch (updateError) {
        console.log("Document doesn't exist, will create new one");
        // Document doesn't exist, we'll create it during export
      }

      // Export the document
      const response = await exportDocument(documentId);
      
      clearInterval(progressInterval);
      setGenerationProgress(100);

      // Create download link
      const blob = new Blob([response], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${fileName || "generated_document"}.docx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Show success message
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationProgress(0);
        setShowGenerationModal(false);
        alert("Document generated and downloaded successfully with your changes!");
      }, 500);

    } catch (error) {
      console.error("Error generating document:", error);
      setError("Failed to generate document. Please try again.");
      setIsGenerating(false);
      setGenerationProgress(0);
      setShowGenerationModal(false);
    }
  }, [highlightsArray, documentChanges, id, fileName]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading template highlights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Error Loading Template</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-2">Troubleshooting:</h3>
            <ul className="text-red-700 text-sm space-y-1">
              <li>• Check if the template ID is correct</li>
              <li>• Verify the template exists in the project</li>
              <li>• Try refreshing the page</li>
              <li>• Contact support if the issue persists</li>
            </ul>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2">
    
      {highlightsArray.length > 0 ? (
        <HighlightTable 
          highlightsArray={highlightsArray} 
          templateId={id} 
          filename={fileName}
          onHighlightChange={handleHighlightChange}
          onGenerateDocument={handleGenerateDocumentWithChanges}
          parentIsGenerating={isGenerating}
          parentGenerationProgress={generationProgress}
          showGenerationModal={showGenerationModal}
          onCloseGenerationModal={() => setShowGenerationModal(false)}
        />
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md">
            <div className="text-gray-400 text-6xl mb-4">📄</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              {fileName || 'Template'}
            </h2>
            <p className="text-gray-600 mb-6">
              No highlights found in this template. Please add highlights in the template editor first.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Next Steps:</h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Go back to the template editor</li>
                <li>• Add highlights to the template content</li>
                <li>• Save the template with highlights</li>
                <li>• Return here to generate documents</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportComponent;