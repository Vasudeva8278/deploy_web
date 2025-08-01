import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  PlusCircleIcon,
  DownloadIcon,
  ArrowLeftIcon,
  ViewBoardsIcon,
  EyeIcon,
  TrashIcon,
  MinusIcon,
} from "@heroicons/react/outline";
import { v4 as uuidv4 } from "uuid";
import imageIcon from "../Assets/image.png";
import tableIcon from "../Assets/table.png";
import DocumentHighlightsModal from "../components/Documents/DocumentHighlightsModal";
import { ViewListIcon } from "@heroicons/react/solid";
import Instructions from "../components/Instructions";
import TableHeader from "../components/TableHeader";
import { FaArrowRight } from "react-icons/fa";
import NeoModal from "../components/NeoModal";

import {
  addNewDocument,
  deleteDocument,
  exportDocument,
  generateZipFile,
  getDocumentsListByTemplateId,
  updateDocHighlightText,
} from "../services/documentApi";
import TooltipIcon from "../components/TooltipIcon";
import FileCarousel from "../components/FileCarousel";
import Carousel from "../components/FileCarousel";

// Debounce function for API calls
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const HighlightTable = ({ 
  highlightsArray, 
  templateId, 
  filename,
  onHighlightChange,
  onGenerateDocument,
  parentIsGenerating,
  parentGenerationProgress,
  showGenerationModal,
  onCloseGenerationModal
}) => {
  const navigate = useNavigate();
  const [tableData, setTableData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [highlight, setHighlight] = useState("");
  const [msDocument, setMsDocument] = useState("");
  const [rowNo, setRowNo] = useState("");
  const [cellNo, setCellNo] = useState("");
  const [currentDoc, setCurrentDoc] = useState("");
  const [conversionStatus, setConversionStatus] = useState("");
  const contentRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [labelPage, setLabelPage] = useState(0);
  const labelsPerPage = 5; // Show 5 label fields at a time
  const [docPage, setDocPage] = useState(0);
  const docsPerPage = 2; // or 3
  const maxDocPage = Math.max(0, (tableData && Array.isArray(tableData) ? tableData.length : 0) - docsPerPage);
  const visibleDocs = (tableData && Array.isArray(tableData)) ? tableData.slice(docPage, docPage + docsPerPage) : [];
  const [blurPage, setBlurPage] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // Add back necessary state variables
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState("text");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const location = useLocation(); // Gives you access to the current URL including the query string
  const queryParams = new URLSearchParams(location.search);
  const projectId = queryParams.get("projectId");
  const [templateName, setTemplateName] = useState("");

  console.log("HighlightTable props:", { templateId, filename, highlightsArray });
  console.log("HighlightsArray type:", typeof highlightsArray);
  console.log("HighlightsArray length:", highlightsArray?.length);
  console.log("HighlightsArray content:", highlightsArray);

  // Memoized fetch data function with better error handling
  const fetchData = useCallback(async () => {
    try {
      setError(null);
      setIsInitialLoading(true);
      
      // Check if we have required parameters
      if (!templateId) {
        console.warn("No templateId provided, using template highlights");
        throw new Error("No template ID");
      }
      
      const response = await getDocumentsListByTemplateId(projectId, templateId);
      
      // Validate response
      if (!response) {
        console.warn("No response from API, using template highlights");
        throw new Error("No API response");
      }
      
      const templateName = response?.templateName;
      setTemplateName(templateName);
      const data = response?.documents;
      setMsDocument(data);
      console.log("Documents data:", data);

      const items =
        data && data.length > 0
          ? data.map((item) => ({
              id: item._id,
              image: item?.thumbnail,
              title: item.fileName,
              description: item.highlights
                .filter((highlight) => highlight.type === "text")
                .map((highlight) => highlight.text)
                .join(" "),
            }))
          : [];

      setItems(items);
      
      // If documents exist, use them; otherwise use template highlights
      if (data && data.length > 0) {
        console.log("Using existing documents:", data);
        setTableData(data);
      } else {
        console.log("No documents found, using template highlights:", highlightsArray);
        // Process highlightsArray - it's now a direct array, not wrapped
        const templateHighlights = highlightsArray && Array.isArray(highlightsArray) 
          ? highlightsArray 
          : highlightsArray || [];
        
        console.log("Template highlights to display:", templateHighlights);
        
        // Create a single document structure with all template highlights
        const templateDocument = {
          id: uuidv4(),
          templateId,
          fileName: filename || "Template Document",
          highlights: templateHighlights.map((highlight) => ({
            id: highlight.id || highlight._id || uuidv4(),
            label: highlight.label || highlight.name || `Field_${Math.random().toString(36).substr(2, 9)}`,
            text: highlight.text || "",
            type: highlight.type || "text",
            name: highlight.name || highlight.label || highlight.id
          }))
        };
        
        console.log("Created template document:", templateDocument);
        setTableData([templateDocument]);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      
      // Only show error if we don't have template highlights to fall back to
      if (!highlightsArray || (Array.isArray(highlightsArray) && highlightsArray.length === 0)) {
        setError("Failed to load documents. Please try again.");
        return;
      }
      
      // Fallback to template highlights if API fails
      console.log("Falling back to template highlights due to error");
      const templateHighlights = highlightsArray && Array.isArray(highlightsArray) 
        ? highlightsArray 
        : highlightsArray || [];
      
      const templateDocument = {
        id: uuidv4(),
        templateId,
        fileName: filename || "Template Document",
        highlights: templateHighlights.map((highlight) => ({
          id: highlight.id || highlight._id || uuidv4(),
          label: highlight.label || highlight.name || `Field_${Math.random().toString(36).substr(2, 9)}`,
          text: highlight.text || "",
          type: highlight.type || "text",
          name: highlight.name || highlight.label || highlight.id
        }))
      };
      
      console.log("Fallback template document:", templateDocument);
      setTableData([templateDocument]);
      
      // Don't show error if fallback is successful
      console.log("Successfully loaded template highlights as fallback");
    } finally {
      setIsInitialLoading(false);
    }
  }, [highlightsArray, templateId, projectId, filename]);

  useEffect(() => {
    console.log(templateId);
    fetchData();
  }, [fetchData]);

  // Clear error when component successfully loads with template highlights
  useEffect(() => {
    if (tableData && tableData.length > 0 && highlightsArray && highlightsArray.length > 0) {
      console.log("Component loaded successfully with template highlights");
      setError(null);
    }
  }, [tableData, highlightsArray]);

  // Monitor highlightsArray changes
  useEffect(() => {
    console.log("HighlightsArray changed:", highlightsArray);
    if (highlightsArray && highlightsArray.length > 0) {
      console.log("Processing highlightsArray:", highlightsArray);
      const flattenedHighlights = Array.isArray(highlightsArray) 
        ? highlightsArray.flat() 
        : highlightsArray;
      console.log("Flattened highlights:", flattenedHighlights);
    }
  }, [highlightsArray]);

  const viewAllDocument = (docId) => {
    navigate(`/docviewall/${templateId}?projectId=${projectId}`);
  };

  // Add custom field functionality
  const handleAddCustomField = useCallback(() => {
    if (!newFieldLabel.trim()) {
      setError("Please enter a field label");
      return;
    }

    const newField = {
      id: uuidv4(),
      label: newFieldLabel.trim(),
      text: "",
      type: newFieldType,
      name: newFieldLabel.trim(),
      isCustom: true // Mark as custom field
    };

    // Add the new field to all documents in tableData
    const updatedTableData = tableData.map(doc => ({
      ...doc,
      highlights: [...doc.highlights, newField]
    }));

    setTableData(updatedTableData);
    setNewFieldLabel("");
    setNewFieldType("text");
    setShowAddFieldModal(false);
    setError(null);
  }, [newFieldLabel, newFieldType, tableData]);

  // Enhanced document generation with progress
  const handleGenerateDocument = useCallback(async () => {
    if (!tableData || tableData.length === 0) {
      setError("No documents to generate");
      return;
    }

    try {
      setIsGenerating(true);
      setGenerationProgress(0);
      setError(null);

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

      // Generate documents for each row
      const generationPromises = tableData.map(async (doc, index) => {
        try {
          // Update progress based on document processing
          setGenerationProgress(prev => prev + (10 / tableData.length));
          
          // Save document with current highlights
          if (doc.id) {
            await updateDocHighlightText(doc.id, doc);
          }
          
          // Export the document
          const response = await exportDocument(doc.id || doc._id);
          return response;
        } catch (error) {
          console.error(`Error generating document ${index + 1}:`, error);
          throw error;
        }
      });

      const results = await Promise.all(generationPromises);
      
      clearInterval(progressInterval);
      setGenerationProgress(100);

      // Create zip file with all generated documents
      if (results.length > 1) {
        const documentIds = tableData.map(doc => doc.id || doc._id);
        const document = {
          documentIds,
          folderName: filename || "Generated Documents",
          templateId: templateId,
          projectId: projectId,
        };
        
        await generateZipFile(document, filename || "generated_documents");
      }

      // Show success message
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationProgress(0);
        alert("Documents generated successfully!");
      }, 500);

    } catch (error) {
      console.error("Error generating documents:", error);
      setError("Failed to generate documents. Please try again.");
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  }, [tableData, filename, templateId, projectId]);

  // Memoized computed values for better performance - moved before functions that use them
  const totalLabels = useMemo(() => tableData[0]?.highlights?.length || 0, [tableData]);
  const visibleLabelIndexes = useMemo(() => 
    Array.from({ length: totalLabels }, (_, i) => i), 
    [totalLabels]
  );

  // Memoized filtered highlights
  const filteredHighlights = useMemo(() => 
    tableData[0]?.highlights?.filter(highlight => {
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      const labelMatch = highlight.label?.toLowerCase().includes(searchLower);
      const typeMatch = highlight.type?.toLowerCase().includes(searchLower);
      const textMatch = highlight.text?.toLowerCase().includes(searchLower);
      
      return labelMatch || typeMatch || textMatch;
    }) || [], 
    [tableData, searchTerm]
  );

  // Memoized mapping from filtered index to original index
  const filteredToOriginalIndex = useMemo(() => 
    tableData[0]?.highlights?.map((highlight, originalIndex) => {
      const searchLower = searchTerm.toLowerCase();
      const labelMatch = highlight.label?.toLowerCase().includes(searchLower);
      const typeMatch = highlight.type?.toLowerCase().includes(searchLower);
      const textMatch = highlight.text?.toLowerCase().includes(searchLower);
      
      return (labelMatch || typeMatch || textMatch) ? originalIndex : -1;
    }).filter(index => index !== -1) || [], 
    [tableData, searchTerm]
  );

  const filteredLabelIndexes = useMemo(() => 
    filteredHighlights.map((_, index) => index), 
    [filteredHighlights]
  );

  // Enhanced input change handler with custom field support and real-time updates
  const handleInputChange = useCallback((value, rowIndex, cellIndex) => {
    console.log("handleInputChange called with:", { value, rowIndex, cellIndex });
    
    if (!tableData[0] || !tableData[0].highlights) {
      console.error("No table data or highlights available");
      return;
    }
    
    // If cellIndex is false, it's a filename change
    if (cellIndex === false) {
      const updatedTableData = [...tableData];
      updatedTableData[rowIndex].fileName = value;
      setTableData(updatedTableData);
      return;
    }
    
    // For highlight changes, we need to find the original index
    let originalIndex = cellIndex;
    
    // If we're using filtered highlights, map back to original index
    if (searchTerm && filteredToOriginalIndex.length > 0) {
      originalIndex = filteredToOriginalIndex[cellIndex];
      if (originalIndex === undefined || originalIndex === -1) {
        console.error("Could not map filtered index to original index");
        return;
      }
    }
    
    if (originalIndex === undefined || originalIndex < 0 || originalIndex >= tableData[0].highlights.length) {
      console.error("Invalid originalIndex:", originalIndex, "Highlights length:", tableData[0].highlights.length);
      return;
    }
    
    const updatedTableData = [...tableData];
    try {
      const highlightToUpdate = updatedTableData[0].highlights[originalIndex];
      if (highlightToUpdate) {
        // Validate the value before updating
        const sanitizedValue = typeof value === 'string' ? value.trim() : String(value || '');
        console.log(`Updating highlight ${originalIndex} (${highlightToUpdate.label}) with value:`, sanitizedValue);
        
        highlightToUpdate.text = sanitizedValue;
        
        // If this is a custom field, update the label if needed
        if (highlightToUpdate.isCustom && !highlightToUpdate.label) {
          highlightToUpdate.label = `Custom_${Math.random().toString(36).substr(2, 9)}`;
        }
        
        // Call parent's onHighlightChange function for real-time updates
        if (onHighlightChange) {
          onHighlightChange(highlightToUpdate.id, sanitizedValue);
        }
        
        setTableData(updatedTableData);
        console.log("Table data updated successfully");
      } else {
        console.error("Highlight not found at index:", originalIndex);
        return;
      }
    } catch (err) {
      console.error("Error updating highlight:", err);
      updatedTableData[0].fileName = value;
      setTableData(updatedTableData);
    }
  }, [tableData, onHighlightChange, searchTerm, filteredToOriginalIndex]);

  // Optimized delete document handler with better error handling
  const handleDeleteDocument = useCallback(async (doc) => {
    setBlurPage(true);
    const doc_id = doc.id ? doc.id : doc._id;
    
    try {
      const response = await deleteDocument(projectId, doc_id);
      if (response) {
        // Remove the deleted row from tableData
        setTableData(prev =>
          prev.filter(row => (row.id || row._id) !== doc_id)
        );
      }
    } catch (error) {
      console.error("Delete failed", error);
      setError("Failed to delete document. Please try again.");
    } finally {
      setBlurPage(false);
    }
  }, [projectId]);

  const handleViewDocument = useCallback(async (doc) => {
    const doc_id = doc.id ? doc.id : doc._id;
    console.log("viewing document", doc_id);
    navigate(`/docview/${doc_id}`);
  }, [navigate]);

  const displayListofDocuments = useCallback(async () => {
    console.log("list of all document");
    navigate(`/listview`, { state: { data: tableData } });
  }, [navigate, tableData]);

  const changeImage = useCallback((event, rowIndex, cellIndex) => {
    if (!tableData[0] || !tableData[0].highlights) {
      console.error("No table data or highlights available");
      return;
    }
    
    // Get the original index if we're searching, otherwise use cellIndex directly
    const originalIndex = searchTerm ? filteredToOriginalIndex[cellIndex] : cellIndex;
    
    if (originalIndex === undefined || originalIndex < 0 || originalIndex >= tableData[0].highlights.length) {
      console.error("Invalid originalIndex:", originalIndex, "Highlights length:", tableData[0].highlights.length);
      return;
    }
    
    const highlight = tableData[0].highlights[originalIndex];
    if (!highlight) {
      console.error("Highlight not found at index:", originalIndex);
      return;
    }
    
    setIsModalOpen(true);
    setHighlight(highlight);
    setCurrentDoc(tableData[0]);
    setRowNo(0); // Always use 0 since we only have one document
    setCellNo(originalIndex); // Use original index for saving
  }, [tableData, searchTerm]);

  // Debounced save function to prevent multiple rapid API calls
  const debouncedSave = useMemo(
    () => debounce(async (doc_id, updatedRow) => {
      if (isUpdating) return; // Prevent concurrent updates
      
      // Validate data before sending to API
      if (!doc_id || !updatedRow) {
        console.error('Invalid data for API call:', { doc_id, updatedRow });
        return;
      }

      // Validate highlights structure
      if (!updatedRow.highlights || !Array.isArray(updatedRow.highlights)) {
        console.error('Invalid highlights structure:', updatedRow.highlights);
        return;
      }

      try {
        setIsUpdating(true);
        console.log('Sending update to API:', { doc_id, updatedRow });
        
        const response = await updateDocHighlightText(doc_id, updatedRow);
        if (response) {
          console.log("Successfully updated document");
        } else {
          console.warn("API returned null/undefined - update may have failed");
        }
      } catch (error) {
        console.error("Failed to update document:", error);
        
        // Don't show error to user for every failed save - just log it
        // This prevents spam of error messages during typing
        if (error.response?.status === 500) {
          console.warn("Server error (500) - will retry on next save");
          // Store the failed update for potential retry later
          // For now, just log it and continue
        } else {
          // Only show user error for non-500 errors
          setError("Failed to save changes. Please try again.");
        }
      } finally {
        setIsUpdating(false);
      }
    }, 1000), // 1 second debounce
    [isUpdating]
  );

  // Add a retry mechanism for failed saves
  const retryFailedSaves = useCallback(() => {
    // This could be implemented to retry failed saves
    // For now, just clear any error state
    setError(null);
  }, []);

  const saveTableOrImage = useCallback(async (value) => {
    if (!tableData[0] || !tableData[0].highlights) {
      console.error("No table data or highlights available");
      return;
    }
    
    if (cellNo === undefined || cellNo < 0 || cellNo >= tableData[0].highlights.length) {
      console.error("Invalid cellNo:", cellNo, "Highlights length:", tableData[0].highlights.length);
      return;
    }
    
    const updatedTableData = [...tableData];
    const highlightToUpdate = updatedTableData[0].highlights[cellNo];
    
    if (!highlightToUpdate) {
      console.error("Highlight not found at index:", cellNo);
      return;
    }
    
    highlightToUpdate.text = value;
    const updatedRow = updatedTableData[0];
    const updatedHighlight = highlightToUpdate;
    
    console.log("Updated highlight:", updatedHighlight);
    console.log("Updated row:", updatedRow);
    
    const doc_id = updatedRow.id ? updatedRow.id : updatedRow._id;
    
    // Use debounced save to prevent rapid API calls
    debouncedSave(doc_id, updatedRow);
  }, [tableData, cellNo, debouncedSave]);

  // Optimized blur handler with better error handling
  const handleBlur = useCallback(async (rowIndex, cellIndex) => {
    console.log("handleBlur called with:", { rowIndex, cellIndex });
    
    if (!tableData[0] || !tableData[0].highlights) {
      console.error("No table data or highlights available");
      return;
    }
    
    // If cellIndex is false, it's a filename change - no need to save
    if (cellIndex === false) {
      return;
    }
    
    // For highlight changes, we need to find the original index
    let originalIndex = cellIndex;
    
    // If we're using filtered highlights, map back to original index
    if (searchTerm && filteredToOriginalIndex.length > 0) {
      originalIndex = filteredToOriginalIndex[cellIndex];
      if (originalIndex === undefined || originalIndex === -1) {
        console.error("Could not map filtered index to original index");
        return;
      }
    }
    
    if (originalIndex === undefined || originalIndex < 0 || originalIndex >= tableData[0].highlights.length) {
      console.error("Invalid originalIndex:", originalIndex, "Highlights length:", tableData[0].highlights.length);
      return;
    }
    
    const updatedRow = { ...tableData[0] }; // Create a copy to avoid mutations
    const updatedHighlight = updatedRow.highlights[originalIndex];
    
    if (!updatedHighlight) {
      console.error("Highlight not found at index:", originalIndex);
      return;
    }

    // Validate the highlight data before sending
    if (!updatedHighlight.id || !updatedHighlight.label) {
      console.error("Invalid highlight data:", updatedHighlight);
      return;
    }
    
    console.log("Updated row:", updatedRow);
    console.log("Updated highlight:", updatedHighlight);
    
    const doc_id = updatedRow.id ? updatedRow.id : updatedRow._id;
    
    // Only save if we have a valid document ID
    if (!doc_id) {
      console.error("No valid document ID found");
      return;
    }
    
    // Use debounced save to prevent rapid API calls
    debouncedSave(doc_id, updatedRow);
  }, [tableData, debouncedSave, searchTerm, filteredToOriginalIndex]);

  const handleBack = useCallback(() => {
    navigate("/Neo");
  }, [navigate]);

  const handleExportTemplate = useCallback((row) => {
    handleExport(templateId, row);
  }, [templateId]);

  const handleExport = useCallback(async (row) => {
    try {
      const response = exportDocument(row._id);
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", row.fileName.trim() + ".docx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading document:", error);
      setError("Failed to download document. Please try again.");
    }
  }, []);

  const handleDocument = useCallback((rowIndex, cellIndex) => {
    if (!tableData[0] || !tableData[0].content) {
      console.error("No table data or content available");
      return;
    }
    setConversionStatus(tableData[0].content);
  }, [tableData]);

  const handleAddRow = useCallback(async () => {
    if (!tableData[0] || !tableData[0].highlights) {
      console.error("No table data or highlights available");
      return;
    }
    
    try {
      const newCells = {
        id: uuidv4(),
        templateId,
        fileName: "DocName" + tableData.length,
        highlights: tableData[0].highlights.map((cell) => ({
          id: cell.id,
          label: cell.label,
          text: cell.text,
          type: cell.type,
        })),
      };
      console.log("Sending to backend:", newCells);
      const response = await addNewDocument(newCells);
      const { id } = response;
      newCells.id = id;
      setTableData([...tableData, newCells]);
    } catch (error) {
      console.error("Error adding new row:", error);
      setError("Failed to add new document. Please try again.");
    }
  }, [tableData, templateId]);

  const handleExportAll = useCallback(async (event) => {
    event.preventDefault();
    
    if (!msDocument || msDocument.length === 0) {
      setError("No documents to export.");
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const documentIds = msDocument.map((doc) => doc._id);
      const document = {
        documentIds,
        folderName: filename,
        templateId: templateId,
        projectId: projectId,
      };
      
      const response = await generateZipFile(document, filename);
      if (response === "Success") {
        console.log("Export successful");
      } else {
        setError("Export failed. Please try again.");
      }
    } catch (error) {
      console.error("Export error:", error);
      setError("Failed to export documents. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [msDocument, filename, templateId, projectId]);

  const handleTextEdit = useCallback((index, text) => {
    const updatedHighlights = [...tableData[0].highlights];
    updatedHighlights[index].text = text;
    setTableData(prev => ({ ...prev, highlights: updatedHighlights }));
  }, [tableData]);

  const handleTableEdit = useCallback((highlight) => {
    setHighlight(highlight);
    setIsModalOpen(true);
  }, []);

  const handleImageEdit = useCallback((highlight) => {
    setHighlight(highlight);
    setIsModalOpen(true);
  }, []);

  const handleRemoveHighlight = useCallback(async (id) => {
    const updatedHighlights = tableData[0].highlights.filter(h => h.id !== id);
    setTableData(prev => ({ ...prev, highlights: updatedHighlights }));
    
    // Optionally, update the document in the backend
    const doc_id = tableData[0].id;
    if (doc_id) {
      try {
        await updateDocHighlightText(doc_id, { highlights: updatedHighlights });
        fetchData();
      } catch (error) {
        console.error("Error removing highlight:", error);
        setError("Failed to remove highlight. Please try again.");
      }
    }
  }, [tableData, fetchData]);

  return (
    <div className={`w-full${blurPage ? ' blur-sm pointer-events-none' : ''}`}>
      {/* Initial Loading Indicator */}
      {isInitialLoading && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
            <span className="text-sm text-blue-800">Loading template highlights...</span>
          </div>
        </div>
      )}

      {/* Error Display - only show if not loading and we have an error */}
      {error && !isInitialLoading && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3 flex items-center space-x-2">
              <button
                onClick={retryFailedSaves}
                className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
              >
                Retry
              </button>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {isUpdating && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
            <span className="text-sm text-blue-800">Saving changes...</span>
          </div>
        </div>
      )}

      <div className='w-full rounded-lg'>
        <div className='flex pb-2'>
          <div className='w-96 flex-1 rounded-lg mr-4 text-gray-400 pt-2 text-sm'>
            <div className='flex'>
              {/*Project Name <FaArrowRight className="text-gray-500 pt-2" size={16} />*/}{" "}
              {templateName}
            </div>
          </div>
          <div className='w-1/2 text-gray-400 rounded-lg mr-4'>
            <input
              type='text'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder='Search by label, table, or image...'
              className='px-4 py-2 w-full max-w-md border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div className='w-1/4 rounded-lg mr-4'>
            <button
              className='px-2 py-2 bg-gray-200 border-black-500 text-blue-500 rounded hover:bg-gray-600 mr-2'
              onClick={viewAllDocument}
            >
              Preview
            </button>
            <button
              className='px-2 py-2 bg-green-500 border-green-500 text-white rounded hover:bg-green-600 transition-colors mr-2'
              onClick={() => setShowAddFieldModal(true)}
              title="Add custom field"
            >
              + Add Field
            </button>
            <button
              className='px-2 py-2 bg-indigo-500 border-blue-500 text-white rounded hover:bg-blue-600 transition-colors mr-2'
              onClick={onGenerateDocument || handleGenerateDocument}
              disabled={isGenerating || parentIsGenerating || isLoading}
            >
              {isGenerating || parentIsGenerating ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {parentGenerationProgress || generationProgress}%
                </span>
              ) : isLoading ? 'Generating...' : 'Generate Doc'}
            </button>
            <button
              className='px-2 py-2 bg-indigo-500 border-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
              onClick={displayListofDocuments}
            >
              Summary
            </button>
          </div>
          <div className='w-1/8 rounded-lg'>
            <TooltipIcon>
              <ul className='list-disc pl-5 space-y-2 flex-grow'>
                <li>
                  Click the <strong>"+ Add Field"</strong> button to create custom fields for your documents.
                </li>
                <li>
                  <strong>Edit values directly</strong> in the table cells - changes are applied in real-time.
                </li>
                <li>
                  Variable names can be edited by double-clicking on the name.
                  (The allotted space will remain unchanged)
                </li>
                <li>
                  Click on <strong>"Generate Doc"</strong> button to create documents with your custom values and changes.
                </li>
                <li>
                  The documents can be auto formatted in the preview window.
                </li>
                <li>
                  Custom fields are automatically saved and included in document generation.
                </li>
                <li>
                  <strong>Real-time updates:</strong> Your changes are tracked and applied to the final document.
                </li>
              </ul>
            </TooltipIcon>{" "}
          </div>
        </div>
      </div>
      <div className='flex w-full'>
        <div className='w-full bg-white rounded-lg'>
          {tableData.length > 0 && (
            <div className="w-full h-[500px] overflow-hidden border border-gray-200 rounded-lg" style={{height: '500px'}}>
              <div className="h-full overflow-y-auto" style={{height: '100%', overflowY: 'auto'}}>
                <table
                  id='doc-table'
                  className='w-full table-fixed'
                  style={{width: '100%'}}
                >
                <thead className="sticky top-0 bg-gray-300 z-10">
                  <tr className='bg-gray-300 text-gray-700 text-sm font-normal'>
                    <TableHeader
                      tableData={tableData}
                      handleAddRow={handleAddRow}
                      name='Variable Name'
                      firstColumn={true}
                    />
                    {tableData.map((row, rowIndex) => (
                      <th key={rowIndex} className='px-2 text-left'>
                        <div className='flex items-center justify-between text-sm'>
                          <input
                            type='text'
                            value={row.fileName}
                            onChange={(e) =>
                              handleInputChange(e.target.value, rowIndex, false)
                            }
                            onBlur={() => handleBlur(rowIndex, false)}
                            className='h-8 px-2 bg-transparent rounded focus:ring-2 focus:ring-blue-500'
                          />
                          <div className='flex items-center'>
                            {tableData.length > 1 && (
                              <button
                                type="button"
                                className='bg-transparent text-red-400 rounded hover:bg-white transition-colors m-2 flex items-center'
                                onClick={() => handleDeleteDocument(row)}
                              >
                                <MinusIcon className='w-5 h-5 inline-block m-1' />
                                <span className='m-1'>Remove</span>
                              </button>
                            )}
                            <button
                              className='hidden bg-green-500 text-white rounded hover:bg-blue-600 transition-colors m-2'
                              onClick={() => handleViewDocument(row)}
                            >
                              <EyeIcon className='w-5 h-5 inline-block m-1' />
                            </button>
                            <button
                              className='hidden bg-green-500 text-white rounded hover:bg-blue-600 transition-colors m-2'
                              onClick={() => handleExport(row)}
                            >
                              <DownloadIcon className='w-5 h-5 inline-block m-1' />
                            </button>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="overflow-y-auto">
                {filteredLabelIndexes.map((cellIndex) => (
                  <tr key={cellIndex} className='p-1 m-1'>
                    <td className='p-1 m-1 border-r border-gray-300'>
                      <div className='border border-gray-300 rounded p-1 pl-4 m-1 text-sm'>
                        {filteredHighlights[cellIndex].label}
                      </div>
                    </td>
                    {tableData.map((row, rowIndex) => (
                      <td
                        key={rowIndex}
                        className='p-1 m-1 border-r border-gray-300 text-sm'
                      >
                        <div className='border border-gray-300 rounded'>
                          {filteredHighlights[cellIndex].type === 'text' ? (
                            <input
                              type='text'
                              value={filteredHighlights[cellIndex].text}
                              onChange={(e) =>
                                handleInputChange(e.target.value, rowIndex, cellIndex)
                              }
                              onBlur={() => handleBlur(rowIndex, cellIndex)}
                              onFocus={() => handleDocument(rowIndex, cellIndex)}
                              className='rounded focus:ring-2 focus:ring-blue-500 w-full m-0 p-1 pl-4'
                            />
                          ) : filteredHighlights[cellIndex].type === 'image' ? (
                            <>
                              {" "}
                              {filteredHighlights[cellIndex].text !== "" ? (
                                <>
                                  <span
                                    className='font-semibold hidden'
                                    dangerouslySetInnerHTML={{
                                      __html: filteredHighlights[cellIndex].text,
                                    }}
                                  ></span>{" "}
                                  <button
                                    onClick={(e) =>
                                      changeImage(e, rowIndex, cellIndex)
                                    }
                                    className='mt-2'
                                  >
                                    <img src={imageIcon} />
                                  </button>
                                </>
                              ) : (
                                <button>
                                  <input
                                    type='file'
                                    name='selectedImage'
                                    onChange={(e) =>
                                      changeImage(
                                        e.target.value,
                                        rowIndex,
                                        cellIndex
                                      )
                                    }
                                    accept='image/*'
                                    className='mt-2'
                                  />
                                </button>
                              )}{" "}
                            </>
                          ) : filteredHighlights[cellIndex].type === 'table' ? (
                            <>
                              {" "}
                              {filteredHighlights[cellIndex].text !== "" ? (
                                <>
                                  <span
                                    className='font-normal hidden'
                                    dangerouslySetInnerHTML={{
                                      __html: filteredHighlights[cellIndex].text,
                                    }}
                                  ></span>
                                  <button
                                    onClick={(e) =>
                                      changeImage(e, rowIndex, cellIndex)
                                    }
                                    className='mt-2'
                                  >
                                    <img src={tableIcon} />
                                  </button>
                                </>
                              ) : (
                                <button>+add</button>
                              )}{" "}
                            </>
                          ) : (
                            " "
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
          )}
          
          <div
            ref={contentRef}
            id='hiddenRenderDoc'
            dangerouslySetInnerHTML={{ __html: conversionStatus }}
            className='border p-4 mr-4 flex-grow bg-white shadow-sm rounded-lg hidden'
            style={{ height: "500px", overflow: "auto" }}
          ></div>
          {isLoading && (
            <div className='fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50'>
              <div className='loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32'></div>
            </div>
          )}
          <div className='mt-4 space-x-2 hidden'>
            <button
              className='px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors'
              onClick={handleBack}
            >
              <ArrowLeftIcon className='w-5 h-5 inline-block mr-2' /> Back
            </button>
            <button
              className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors'
              onClick={handleExportAll}
            >
              <DownloadIcon className='w-5 h-5 inline-block mr-2' /> Export All
            </button>
            <button
              className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors'
              onClick={viewAllDocument}
            >
              <ViewListIcon className='w-5 h-5 inline-block mr-2' /> View All
            </button>
          </div>
          <div>
            <DocumentHighlightsModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSave={saveTableOrImage}
              highlight={highlight}
              tempDocument={currentDoc}
              initialText={highlight.text}
            />
          </div>
          
          {/* Custom Field Modal */}
          <NeoModal isOpen={showAddFieldModal} onClose={() => setShowAddFieldModal(false)}>
            <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Add Custom Field
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="fieldLabel" className="block text-sm font-medium text-gray-700 mb-1">
                      Field Label
                    </label>
                    <input
                      type="text"
                      id="fieldLabel"
                      value={newFieldLabel}
                      onChange={(e) => setNewFieldLabel(e.target.value)}
                      placeholder="Enter field name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="fieldType" className="block text-sm font-medium text-gray-700 mb-1">
                      Field Type
                    </label>
                    <select
                      id="fieldType"
                      value={newFieldType}
                      onChange={(e) => setNewFieldType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="text">Text</option>
                      <option value="table">Table</option>
                      <option value="image">Image</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-center space-x-3 mt-6">
                  <button
                    onClick={() => setShowAddFieldModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCustomField}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add Field
                  </button>
                </div>
              </div>
            </div>
          </NeoModal>
          
          {/* Generation Progress Modal */}
          <NeoModal isOpen={showGenerationModal} onClose={onCloseGenerationModal}>
            <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Generating Document
                </h3>
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                      style={{ width: `${parentGenerationProgress || generationProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {parentGenerationProgress || generationProgress}% Complete
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  Applying your changes and generating the document...
                </p>
              </div>
            </div>
          </NeoModal>
        </div>
      </div>
      <div className='flex ml-12'>
        <div className='mt-4'>
          <div className="flex items-center gap-x-4 overflow-x-auto py-4">
            {tableData.map((doc) => (
              <div
                key={doc.id}
                className="relative w-24 h-28 min-w-[6rem] bg-white border-2 border-blue-400 rounded-xl flex items-center justify-center mx-2"
              >
                {/* Eye icon in top-right */}
                <button
                  className="absolute top-2 right-2 text-blue-400 hover:text-blue-600"
                  onClick={() => handleViewDocument(doc)}
                  title="Preview"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                {/* Document Name */}
                <span className="text-blue-600 font-semibold text-center text-sm">Doc Name</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/*  <div className="col-span-1 bg-white rounded-lg shadow-md  ">
      Right column content goes here 

        <Instructions handleExportAll={handleExportAll} viewAllDocument={viewAllDocument} displayListofDocuments={displayListofDocuments} />
      </div>*/}
    </div>
  
  );
};

export default HighlightTable;
  