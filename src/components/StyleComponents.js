import { useState } from "react";
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaListUl,
  FaListOl,
  FaLink,
  FaUndo,
  FaRedo,
  FaPalette,
} from "react-icons/fa";

const StyleComponents = ({ content, handleSave, handleCancel }) => {
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    unorderedList: false,
    orderedList: false,
    link: false,
  });
  const [fontColor, setFontColor] = useState("#000000");
  const [fontSize, setFontSize] = useState("12pt"); // Default font size
  const [fontFamily, setFontFamily] = useState("Arial"); // Default font style

  const handleColorChange = (e) => {
    const color = e.target.value;
    setFontColor(color);
    format("foreColor", color);
  };

  const sizeMap = {
    1: "8pt",
    2: "10pt",
    3: "12pt",
    4: "14pt",
    5: "18pt",
    6: "24pt",
    7: "36pt",
  };

  const format = (command, value = null) => {
    document.execCommand(command, false, value);
    updateActiveFormats();
    if (content.current) {
      content.current.focus();
    }
  };

  const reverseSizeMap = Object.fromEntries(
    Object.entries(sizeMap).map(([key, value]) => [value, key])
  );

  const handleFontSizeChange = (e) => {
    const sizeWithPt = e.target.value; // Get the selected value, e.g., '16pt'
    const size = reverseSizeMap[sizeWithPt] || "3"; // Convert 'pt' to a value between 1 and 7, default to '3'
    setFontSize(sizeWithPt); // Optionally, set the font size including 'pt'
    format("fontSize", size); // Pass the numerical value between 1 and 7 to the format function
  };

  const handleFontFamilyChange = (e) => {
    const family = e.target.value;
    setFontFamily(family);
    format("fontName", family);
  };

  const createLink = () => {
    const url = prompt("Enter the URL:");
    if (url) {
      format("createLink", url);
      setActiveFormats((prev) => ({ ...prev, link: true }));
    }
  };

  const updateActiveFormats = () => {
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      unorderedList: document.queryCommandState("insertUnorderedList"),
      orderedList: document.queryCommandState("insertOrderedList"),
      link: document.queryCommandState("createLink"),
    });
  };

  return (
    /*  <div>
      <h2 className="text-lg font-semibold mb-4">Options</h2>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => format("bold")}
          className={`p-2 rounded hover:bg-gray-200 ${
            activeFormats.bold ? "bg-gray-300" : ""
          }`}
        >
          <FaBold />
        </button>
        <button
          onClick={() => format("italic")}
          className={`p-2 rounded hover:bg-gray-200 ${
            activeFormats.italic ? "bg-gray-300" : ""
          }`}
        >
          <FaItalic />
        </button>
        <button
          onClick={() => format("underline")}
          className={`p-2 rounded hover:bg-gray-200 ${
            activeFormats.underline ? "bg-gray-300" : ""
          }`}
        >
          <FaUnderline />
        </button>
        <button
          onClick={() => format("insertUnorderedList")}
          className={`p-2 rounded hover:bg-gray-200 ${
            activeFormats.unorderedList ? "bg-gray-300" : ""
          }`}
        >
          <FaListUl />
        </button>
        <button
          onClick={() => format("insertOrderedList")}
          className={`p-2 rounded hover:bg-gray-200 ${
            activeFormats.orderedList ? "bg-gray-300" : ""
          }`}
        >
          <FaListOl />
        </button>
        <button
          onClick={createLink}
          className={`p-2 rounded hover:bg-gray-200 ${
            activeFormats.link ? "bg-gray-300" : ""
          }`}
        >
          <FaLink />
        </button>
      </div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => format("undo")}
          className="p-2 rounded hover:bg-gray-200"
        >
          <FaUndo />
        </button>
        <button
          onClick={() => format("redo")}
          className="p-2 rounded hover:bg-gray-200"
        >
          <FaRedo />
        </button>
        <div className="flex items-center">
          <input
            id="color-picker"
            type="color"
            value={fontColor}
            onChange={handleColorChange}
            className="position-absolute border-none rounded m-1 visible w-5"
          />
        </div>
      </div>
      <div className="mb-4">
        <label htmlFor="font-size-picker" className="block mb-1">
          Font Size
        </label>
        <select
          id="font-size-picker"
          value={fontSize}
          onChange={handleFontSizeChange}
          className="w-full p-2 border rounded"
        >
          {Object.values(sizeMap).map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="font-family-picker" className="block mb-1">
          Font Style
        </label>
        <select
          id="font-family-picker"
          value={fontFamily}
          onChange={handleFontFamilyChange}
          className="w-full p-2 border rounded"
        >
          {[
            "Arial",
            "Times New Roman",
            "Verdana",
            "Courier New",
            "Georgia",
            "Palatino Linotype",
            "Tahoma",
            "Trebuchet MS",
            "Impact",
          ].map((family) => (
            <option key={family} value={family}>
              {family}
            </option>
          ))}
        </select>
      </div>
      <div className="flex justify-between">
        <button
          onClick={handleSave}
          className="ml-5 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save Changes
        </button>
        <button className="mr-5 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Cancel Changes
        </button>
      </div>
    </div> */
    <div className="p-4 border rounded bg-gray-100">
      <h2 className="text-lg font-semibold mb-4">Options Toolbar</h2>
      <div className="flex items-center gap-4 flex-wrap mb-4 bg-white p-2 rounded shadow">
        {/* Formatting Buttons */}
        <button
          onClick={() => format("bold")}
          className={`p-2 rounded hover:bg-gray-200 ${
            activeFormats.bold ? "bg-gray-300" : ""
          }`}
          title="Bold"
        >
          <FaBold />
        </button>
        <button
          onClick={() => format("italic")}
          className={`p-2 rounded hover:bg-gray-200 ${
            activeFormats.italic ? "bg-gray-300" : ""
          }`}
          title="Italic"
        >
          <FaItalic />
        </button>
        <button
          onClick={() => format("underline")}
          className={`p-2 rounded hover:bg-gray-200 ${
            activeFormats.underline ? "bg-gray-300" : ""
          }`}
          title="Underline"
        >
          <FaUnderline />
        </button>
        <button
          onClick={() => format("insertUnorderedList")}
          className={`p-2 rounded hover:bg-gray-200 ${
            activeFormats.unorderedList ? "bg-gray-300" : ""
          }`}
          title="Unordered List"
        >
          <FaListUl />
        </button>
        <button
          onClick={() => format("insertOrderedList")}
          className={`p-2 rounded hover:bg-gray-200 ${
            activeFormats.orderedList ? "bg-gray-300" : ""
          }`}
          title="Ordered List"
        >
          <FaListOl />
        </button>
        <button
          onClick={createLink}
          className={`p-2 rounded hover:bg-gray-200 ${
            activeFormats.link ? "bg-gray-300" : ""
          }`}
          title="Insert Link"
        >
          <FaLink />
        </button>

        {/* Undo, Redo, and Color Picker */}
        <button
          onClick={() => format("undo")}
          className="p-2 rounded hover:bg-gray-200"
          title="Undo"
        >
          <FaUndo />
        </button>
        <button
          onClick={() => format("redo")}
          className="p-2 rounded hover:bg-gray-200"
          title="Redo"
        >
          <FaRedo />
        </button>
        <input
          id="color-picker"
          type="color"
          value={fontColor}
          onChange={handleColorChange}
          className="w-8 h-8 p-0 border-none rounded-full cursor-pointer"
          title="Font Color"
        />

        {/* Font Size Selector */}
        <select
          id="font-size-picker"
          value={fontSize}
          onChange={handleFontSizeChange}
          className="p-2 border rounded"
          title="Font Size"
        >
          {Object.values(sizeMap).map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>

        {/* Font Family Selector */}
        <select
          id="font-family-picker"
          value={fontFamily}
          onChange={handleFontFamilyChange}
          className="p-2 border rounded"
          title="Font Family"
        >
          {[
            "Arial",
            "Times New Roman",
            "Verdana",
            "Courier New",
            "Georgia",
            "Palatino Linotype",
            "Tahoma",
            "Trebuchet MS",
            "Impact",
          ].map((family) => (
            <option key={family} value={family}>
              {family}
            </option>
          ))}
        </select>
      </div>
      <div className="flex justify-between mt-4">
        {/* Save and Cancel Buttons */}
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save Changes
        </button>
        <button
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          onClick={handleCancel}
        >
          Cancel Changes
        </button>
      </div>
    </div>
  );
};

export default StyleComponents;
