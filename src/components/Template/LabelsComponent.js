import React, { useEffect, useState } from "react";
import { getExistingLabelsInProject } from "../../services/projectApi";

const LabelsComponent = ({
  newHighlight,
  handleInputChange,
  existingLabels,
  labelType,
}) => {
  const [activeTab, setActiveTab] = useState("existing"); // Default to 'existing'
  //  const [existingLabels, setExistingLabels] = useState([]); // Store fetched labels
  const [selectedLabel, setSelectedLabel] = useState(""); // Track selected label value
  /*
  const fetchLabels = async (projectId) => {
    console.log(projectId);
    try {
      const result = await getExistingLabelsInProject(projectId);
      setExistingLabels(result || []);
      console.log("Existing Labels: ", result);
    } catch (error) {
      console.error("Error updating templates: ", error);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchLabels(projectId);
    }
  }, []);*/

  const handleLabelChange = (e) => {
    const selectedLabel = e.target.value;
    setSelectedLabel(selectedLabel);

    // Find the highlight object for this label
    const selectedHighlight = existingLabels.find(
      (highlight) => highlight.label === selectedLabel
    );

    // Set both label and value in the parent state
    handleInputChange({
      target: { name: "label", value: selectedHighlight?.label || "" }
    });
    handleInputChange({
      target: { name: "text", value: selectedHighlight?.text || "" }
    });
  };

  return (
    <div className='w-full mx-auto bg-white rounded-lg shadow-md'>
      {/* Tab Buttons */}
      <div className='flex border-b'>
        <button
          className={`w-1/2 py-2 text-center font-semibold ${
            activeTab === "existing"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-blue-600"
          }`}
          onClick={() => setActiveTab("existing")}
        >
          Existing
        </button>
        <button
          className={`w-1/2 py-2 text-center font-semibold ${
            activeTab === "new"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-blue-600"
          }`}
          onClick={() => setActiveTab("new")}
        >
          New
        </button>
      </div>

      {/* Tab Content */}
      <div className='p-6'>
        {activeTab === "existing" && (
          <div>
            {/* Dropdown for Existing Labels */}
            <div className='mb-4'>
              <select
                value={selectedLabel}
                onChange={handleLabelChange}
                className='w-full border border-gray-300 p-2 rounded'
              >
                <option value='' disabled>
                  Select a label
                </option>
                {existingLabels.map((highlight, index) => (
                  <option key={index} value={highlight.label}>
                    {highlight.label} {highlight.text ? `- ${highlight.text}` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Display Selected Label and Value */}
            <div className='flex border rounded-md px-2 py-2'>
              <input
                type='text'
                placeholder='Label'
                name='label'
                className='w-full border border-gray-300 p-2 rounded mr-2'
                value={newHighlight.label}
                readOnly
              />
              <input
                type='text'
                placeholder='Value'
                name='text'
                className='w-full border border-gray-300 p-2 rounded'
                value={newHighlight.text}
                onChange={handleInputChange}
                hidden={labelType === "text" ? false : true}
              />
            </div>
          </div>
        )}
        {activeTab === "new" && (
          <div className='flex border rounded-md px-2 py-2 w-full '>
            <input
              type='text'
              placeholder='Label'
              name='label'
              className='w-full border border-gray-300 p-2 rounded mr-2'
              value={newHighlight.label}
              onChange={handleInputChange}
            />
            <input
              type='text'
              placeholder='Value'
              name='text'
              className='w-full border border-gray-300 p-2 rounded'
              value={newHighlight.text}
              onChange={handleInputChange}
              hidden={labelType === "text" ? false : true}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LabelsComponent;
