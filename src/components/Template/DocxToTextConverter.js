import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import EditModal from "./EditModal";
import {
	PencilIcon,
	TrashIcon,
	PlusCircleIcon,
	SaveIcon,
	DotsHorizontalIcon,
} from "@heroicons/react/solid";
import { ArrowLeftIcon } from "@heroicons/react/outline";
import table from "../../Assets/table.png";
import image from "../../Assets/image.png";
import NeoModal from "../NeoModal";
import { getTemplatesById } from "../../services/templateApi";
import {
	deleteHighlight,
	getImgLink,
	saveOrUpdateHighlights,
	saveTemplateContent,
	uploadImg,
} from "../../services/highlightsApi";
import StyleComponents from "../StyleComponents";
import LabelsComponent from "./LabelsComponent";
import { getExistingLabelsInProject } from "../../services/projectApi";

function DocxToTextConverter() {
	const navigate = useNavigate();
	const { id } = useParams();
	const [conversionStatus, setConversionStatus] = useState("");
	const [highlights, setHighlights] = useState([]);
	const [templateId, setTemplateId] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editHighlightId, setEditHighlightId] = useState(null);
	const [editInitialText, setEditInitialText] = useState("");
	const [addLabel, setAddLabel] = useState(false);
	const [originalImage, setOriginalImage] = useState("");
	const [newHighlight, setNewHighlight] = useState({
		id: "",
		label: "",
		text: "",
		type: "text",
		name: "",
		multi: false,
	});
	const contentRef = useRef(null);
	const highlightCounter = useRef(0);
	const [fileName, setFileName] = useState("");
	const [isEditingFileName, setIsEditingFileName] = useState(false);
	const [selection, setSelection] = useState();
	const [searchText, setSearchText] = useState("");
	const [isMultiple, setIsMultiple] = useState(false);
	const [highlightName, setHighlightName] = useState("");
	const [editHighlight, setEditHighlight] = useState("");
	const [addTable, setAddTable] = useState(false);
	const [addImage, setAddImage] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const [project, setProject] = useState("");
	const [mouseUpHandled, setMouseUpHandled] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const isTableSelectedRef = useRef(false);
	const isImageSelectedRef = useRef(false);
	const isTextSelectedRef = useRef(false);
	const [isAlertOpen, setIsAlertOpen] = useState(false);
	const [alertText, setAlertText] = useState("");
	const [isResetAll, setIsResetAll] = useState(false);
	const location = useLocation(); // Gives you access to the current URL including the query string
	const queryParams = new URLSearchParams(location.search);
	const projectId = queryParams.get("projectId");
	const [editTemplate, setEditTemplate] = useState(true);
	const [rightSectionVisible, setRightSectionVisible] = useState(false);
	const [isContentTouched, setIsContentTouched] = useState(false);
	const [existingLabels, setExistingLabels] = useState([]); // Store fetched labels

	const fetchLabels = async (projectId) => {
		console.log(projectId);
		try {
			const result = await getExistingLabelsInProject(projectId);

			const groupedLabels = result.reduce((acc, item) => {
				acc[item.highlightType] = item.labels;
				return acc;
			}, {});

			console.log(groupedLabels);
			setExistingLabels(groupedLabels || {});

			console.log("Existing Labels: ", result);
		} catch (error) {
			console.error("Error updating templates: ", error);
		}
	};

	useEffect(() => {
		const fetchDocument = async () => {
			if (id) {
				try {
					const response = await getTemplatesById(projectId, id);
					const result = response;
					setTemplateId(result._id);
					setConversionStatus(result.content);
					setHighlights(result.highlights);
					setFileName(result.fileName);
					setProject(result.projectId); // to get complete project Object to pass in state.
				} catch (error) {
					console.error("Failed to fetch document", error);
				}
			}
		};

		fetchDocument();
		fetchLabels(projectId);
	}, [id]);

	const handleContentChange = () => {
		setIsContentTouched(true);
	};
	const handleBack = () => {
		//console.log(projectId);
		if (projectId) {
			navigate(`/projects/${projectId}`, { state: { data: project } });
		} else {
			navigate("/Neo");
		}
	};

	const handleFileNameChange = (e) => {
		setFileName(e.target.value);
	};

	const createHighlightSpan = (elementType, id, content) => {
		const ele = document.createElement(elementType);
		ele.id = id;
		ele.setAttribute("data-highlight-id", id);
		ele.classList.add("highlight");
		ele.innerHTML = content;
		return ele;
	};

	const generateHighlightId = () => {
		const timestamp = new Date().toISOString().replace(/[-T:\.Z]/g, "");
		return `highlight-${highlightCounter.current++}-${timestamp}`;
	};

	const handleImageHighlighting = async (imgData) => {
		if (!imgData) return;

		// Check if the parent element is a div and has data-highlight-id
		const parentElement = imgData.parentNode;
		console.log(parentElement);
		if (
			parentElement &&
			parentElement.tagName === "DIV" &&
			parentElement.hasAttribute("data-highlight-id")
		) {
			const existingHighlightId =
				parentElement.getAttribute("data-highlight-id");
			console.log("existingHighlightId", existingHighlightId);
			if (existingHighlightId) return null;

			// Check if the highlightId exists in the highlights array
			const highlightExists = highlights.some(
				(highlight) => highlight.id === existingHighlightId
			);

			if (highlightExists) {
				console.log(
					`Highlight with ID ${existingHighlightId} already exists.`,
					parentElement
				);
				return null;
			}
		} else {
			const highlightId = generateHighlightId();
			console.log("Img highlight doesnt exists");
			// Create a div element to wrap around the image
			const div = createHighlightSpan(
				"div",
				highlightId,
				imgData.outerHTML
			);
			div.style.border = "1px solid blue";
			div.style.boxSizing = "border-box";
			div.style.display = "inline-block";

			// Create a Blob from the image data if needed
			const newImageBlob = await createBlobFromImage(imgData);
			setOriginalImage(newImageBlob);

			// Update the state with the new highlight information
			setNewHighlight({
				id: highlightId,
				text: imgData.outerHTML,
				label: "",
				type: "image",
				multi: false,
			});
			isImageSelectedRef.current = true;
			console.log(highlightId);
			// Assuming you want to replace the original image with the new highlighted div
			console.log(imgData);

			if (parentElement) {
				parentElement.replaceChild(div, imgData);
			}
			console.log(parentElement.innerHTML);
			return parentElement?.innerHTML;
		}
	};

	const handleTextHighlight = async () => {
		if (addLabel) {
			if (isTextSelectedRef.current) {
				setIsAlertOpen(true);
				setAlertText(
					"Text is already selected. Please cancel and reselect"
				);
				return;
			}
			console.log(addLabel, addImage, addTable);
			if (addImage || addTable) {
				return;
			}
			setNewHighlight({
				id: "",
				text: "",
				label: "",
				type: "",
				name: "",
				multi: false,
			});
			const selection = window.getSelection();
			console.log(selection);
			if (!selection.rangeCount) return;

			const range = selection.getRangeAt(0);

			const selectedText = range.toString();
			console.log(selectedText);
			if (!selectedText) {
				console.log("@170");
				return;
			}

			const highlightId = generateHighlightId();

			const span = document.createElement("span");
			span.textContent = selectedText;
			span.id = highlightId;
			span.setAttribute("data-highlight-id", highlightId);
			span.classList.add("highlight");
			setHighlightName(highlightId);
			if (!isMultiple) {
				console.log("insert for single label");
				range.deleteContents();
				range.insertNode(span);
			}
			console.log(span);
			setNewHighlight({
				id: highlightId,
				text: selectedText,
				label: "",
				name: highlightId,
				type: "text",
				multi: isMultiple,
			});
			isTextSelectedRef.current = true;
			selection.removeAllRanges();
			setSelection(selection);
		}
		// console.log("new Highlight", newHighlight);
	};

	const handleTableHighlighting = (tableData) => {
		if (!tableData) return;

		const parentTag = tableData.parentNode;
		console.log(parentTag);
		if (
			parentTag &&
			parentTag.tagName === "SECTION" &&
			parentTag.hasAttribute("data-highlight-id")
		) {
			console.log("in if");
			const existingHighlightId =
				parentTag.getAttribute("data-highlight-id");
			if (existingHighlightId) return null;

			console.log("existingHighlightId", existingHighlightId);
			// Check if the highlightId exists in the highlights array
			const highlightExists = highlights.some(
				(highlight) => highlight.id === existingHighlightId
			);

			if (highlightExists) {
				console.log(
					`Highlight with ID ${existingHighlightId} already exists.`
				);
				console.log(parentTag);
				return null;
			}
		}

		const highlightId = generateHighlightId();

		const section = createHighlightSpan(
			"section",
			highlightId,
			tableData.outerHTML
		);
		section.style.border = "1px solid blue";
		section.style.boxSizing = "border-box";
		section.style.display = "inline-block";

		setNewHighlight({
			id: highlightId,
			text: tableData.outerHTML,
			label: "",
			type: "table",
			multi: false,
		});
		isTableSelectedRef.current = true;
		console.log(highlightId);
		// Assuming you want to replace the original image with the new highlighted div
		const parentElement = tableData.parentNode;
		if (parentElement) {
			parentElement.replaceChild(section, tableData);
		}
		return parentElement?.innerHTML;
	};

	const addId = async (e) => {
		//console.log(e.target.tagName, "-------------" ,addImage,addTable );
		if (e.target.tagName === "IMG" && addImage) {
			if (isImageSelectedRef.current) {
				setIsAlertOpen(true);
				setAlertText(
					"An Image is aleady selected. Please cancel and re-select."
				);
				return;
			}
			let imgData = e.target;
			imgData = await handleImageHighlighting(imgData);
			console.log(imgData);
			if (imgData !== null) {
				e.target.replaceWith(imgData);
				const updatedContent = contentRef.current.cloneNode(true);
				updatedContent.innerHTML =
					document.getElementById("neoDocView").innerHTML;
			}
		} else if (addTable) {
			if (isTableSelectedRef.current) {
				setIsAlertOpen(true);
				setAlertText(
					"A Table is aleady selected. Please cancel and re-select."
				);
				return;
			}
			console.log("at 271");
			let tableData;
			if (e.target.tagName === "TABLE") {
				tableData = e.target;
			} else if (
				e.target.tagName === "TD" ||
				e.target.tagName === "TR" ||
				e.target.tagName === "P" ||
				e.target.tagName === "SPAN"
			) {
				tableData = e.target.closest("TABLE");
			}
			if (tableData) {
				//console.log(tableData);
				tableData = await handleTableHighlighting(tableData);
				if (tableData !== null) {
					e.target.replaceWith(tableData);
					const updatedContent = contentRef.current.cloneNode(true);
					updatedContent.innerHTML =
						document.getElementById("neoDocView").innerHTML;
				}
			}
		}
	};

	useEffect(() => {
		if (contentRef.current) {
			const contentDiv = contentRef.current;
			const parser = new DOMParser();
			const doc = parser.parseFromString(conversionStatus, "text/html");
			console.log(doc);
			//contentDiv.innerHTML = doc.body.innerHTML;

			// Get the styles from the parsed document
			const styles = doc.querySelectorAll("style");

			// Append the content
			contentDiv.innerHTML = doc.body.innerHTML;

			// Append each style tag to the contentDiv or document head
			styles.forEach((style) => {
				const styleContent = style.innerHTML;

				// Check if any existing style tag in the contentDiv has the same content
				const existingStyle = Array.from(
					contentDiv.querySelectorAll("style")
				).find((existing) => existing.innerHTML === styleContent);

				// If the style content does not exist, append the style tag
				if (!existingStyle) {
					contentDiv.appendChild(style.cloneNode(true));
				}
			});

			const findParentTable = (element) => {
				return element.closest("table");
			};
			const addHighlight = (e) => {
				if (
					e.target.tagName === "TD" ||
					e.target.tagName === "TR" ||
					e.target.tagName === "P" ||
					e.target.tagName === "SPAN"
				) {
					const table = findParentTable(e.target);
					table.style.cursor = "cell";
				}
				if (e.target.tagName === "IMG") {
					e.target.style.cursor = "cell";
				}
			};
			const removeHighlight = (e) => {
				if (e.target.tagName === "TD") {
					const table = findParentTable(e.target);
					table.style.cursor = "";
				}
				if (e.target.tagName === "IMG") {
					e.target.style.cursor = "";
				}
			};
			const attachEventListeners = (element) => {
				if (addTable || addImage) {
					setAddLabel(false);
					if (
						element.tagName === "TABLE" ||
						element.tagName === "IMG"
					) {
						element.addEventListener("mouseover", addHighlight);
						element.addEventListener("mouseout", removeHighlight);
						element.addEventListener("click", addId);
					}
				}
			};
			// Attach event listeners to existing tables and images
			const tables = contentDiv.querySelectorAll("table");
			const images = contentDiv.querySelectorAll("img");
			[...tables, ...images].forEach(attachEventListeners);

			// Set up a MutationObserver to detect new elements
			const observer = new MutationObserver((mutations) => {
				mutations.forEach((mutation) => {
					mutation.addedNodes.forEach((node) => {
						if (
							node.tagName === "TABLE" ||
							node.tagName === "IMG"
						) {
							attachEventListeners(node);
						}
						// If the node is a parent container, check its children
						if (node.querySelectorAll) {
							const newTables = node.querySelectorAll("table");
							const newImages = node.querySelectorAll("img");
							[...newTables, ...newImages].forEach(
								attachEventListeners
							);
						}
					});
				});
			});

			// Start observing the content div for child additions
			observer.observe(contentDiv, { childList: true, subtree: true });

			// Clean up observer and event listeners on unmount
			return () => {
				observer.disconnect();
				[...tables, ...images].forEach((element) => {
					element.removeEventListener("mouseover", addHighlight);
					element.removeEventListener("mouseout", removeHighlight);
					element.removeEventListener("click", addId);
				});
			};
		}
	}, [conversionStatus, addImage, addTable, addLabel]);

	async function createBlobFromImage(originalImg) {
		let imgElement;

		if (typeof originalImg === "string") {
			const parser = new DOMParser();
			const doc = parser.parseFromString(originalImg, "text/html");
			imgElement = doc.querySelector("img");
		} else if (originalImg instanceof HTMLImageElement) {
			imgElement = originalImg;
		}

		if (!imgElement) {
			console.error("Invalid image element");
			return null;
		}

		imgElement.crossOrigin = "Anonymous";

		return new Promise((resolve, reject) => {
			const tempImg = new Image();
			tempImg.crossOrigin = "Anonymous";
			tempImg.src = imgElement.src;

			tempImg.onload = () => {
				const canvas = document.createElement("canvas");
				canvas.width = tempImg.naturalWidth;
				canvas.height = tempImg.naturalHeight;
				const ctx = canvas.getContext("2d");
				ctx.drawImage(tempImg, 0, 0);

				canvas.toBlob((blob) => {
					if (blob) {
						resolve(blob);
					} else {
						console.error("Failed to create blob from image");
						reject("Failed to create blob from image");
					}
				}, "image/png");
			};

			tempImg.onerror = (err) => {
				console.error("Image load error:", err);
				reject("Image load error");
			};
		});
	}

	async function uploadImageAndUpdateSrc(highlightId, imgData) {
		const formData = new FormData();
		formData.append("image", originalImage, `${highlightId}.jpeg`);
		formData.append("highlightId", highlightId);

		let imgElement;
		if (typeof imgData === "string") {
			const parser = new DOMParser();
			const doc = parser.parseFromString(imgData, "text/html");
			imgElement = doc.querySelector("img");
		} else if (imgData instanceof HTMLImageElement) {
			imgElement = imgData;
		}

		if (!imgElement) {
			console.error("Invalid image element");
			return null;
		}

		try {
			const response = await uploadImg(highlightId, formData);
			console.log("Image uploaded successfully:", response.data);

			if (response && response.data) {
				setOriginalImage(null);
				const newImgName = response.data;
				const newSrc = await getImgLink(newImgName);

				// Update the src attribute of the original image element
				imgElement.src = newSrc;
				console.log("Updated image source:", imgElement);
				return imgElement.outerHTML;
			}
		} catch (error) {
			console.error("Error uploading image:", error);
		}
		return null;
	}

	const saveImageLabel = async () => {
		const newText = await uploadImageAndUpdateSrc(
			newHighlight.id,
			newHighlight.text
		);
		console.log(newText);
		newHighlight.text = newText?.toString();
		setHighlights((prevHighlights) => [...prevHighlights, newHighlight]);
		const div = contentRef.current.querySelectorAll(
			`[data-highlight-id="${newHighlight.id}"]`
		);
		if (div[0] && div[0].parentNode) {
			div[0].innerHTML = newHighlight.text;
		}

		await saveHighlights(
			[...highlights, newHighlight],
			contentRef.current.innerHTML
		);
		resetTabs();
	};

	const resetTabs = () => {
		setAddLabel(false);
		setIsMultiple(false);
		setAddImage(false);
		setAddTable(false);
		isTableSelectedRef.current = false;
		isImageSelectedRef.current = false;
		isTextSelectedRef.current = false;
	};

	const saveLabel = () => {
		setHighlights((prevHighlights) => [...prevHighlights, newHighlight]);
		saveHighlights(
			[...highlights, newHighlight],
			contentRef.current.innerHTML
		);
		resetTabs();
	};

	const cancelSaveLabel = () => {
		resetTabs();

		if (newHighlight.text !== "" && newHighlight?.id) {
			console.log("@533");
			// console.log(newHighlight.type, ":::", `[data-highlight-id="${newHighlight.id}"]`);
			// need to be checked again. this is not working.
			if (newHighlight?.type === "text") {
				console.log("@537");
				const spans = contentRef.current.querySelectorAll(
					`[data-highlight-id="${newHighlight.id}"]`
				);
				//  console.log("text spans",spans);
				spans.forEach((span) => {
					if (span && span.parentNode) {
						const textNode = document.createTextNode(
							span.textContent
						);
						// console.log(textNode);
						span.parentNode.replaceChild(textNode, span);
					}
				});
			}

			if (newHighlight?.type === "table") {
				console.log("@550");
				const section = contentRef.current.querySelector(
					`section[data-highlight-id="${newHighlight.id}"]`
				);
				// console.log(section)
				if (section) {
					// Get the parent of the section
					const parent = section.parentNode;
					// Move all child nodes of the section to the parent node
					while (section.firstChild) {
						parent.insertBefore(section.firstChild, section);
					}
					// Remove the section element
					parent.removeChild(section);
				}
			}

			if (newHighlight?.type === "image") {
				console.log("@567");
				const div = contentRef.current.querySelector(
					`div[data-highlight-id="${newHighlight.id}"]`
				);
				if (div) {
					// Get the parent of the section
					const parent = div.parentNode;
					// Move all child nodes of the section to the parent node
					while (div.firstChild) {
						parent.insertBefore(div.firstChild, div);
					}
					// Remove the section element
					parent.removeChild(div);
				}
			}
		}
		setNewHighlight({
			id: "",
			text: "",
			label: "",
			type: "",
			name: "",
			multi: false,
		});
		setSearchText("");
		console.log("@590");
	};

	const handleEditHighlight = (id) => {
		const highlight = highlights.find((highlight) => highlight.id === id);
		if (highlight) {
			setEditHighlight(highlight);
			setEditHighlightId(id);
			setEditInitialText(highlight.text);
			setIsModalOpen(true);
		}
	};

	const handleSaveHighlight = (newText, label) => {
		const updatedHighlights = highlights.map((highlight) =>
			highlight.id === editHighlightId
				? { ...highlight, text: newText, label: label }
				: highlight
		);

		setHighlights(updatedHighlights);
		if (editHighlight.type === "text") {
			const spans = contentRef.current.querySelectorAll(
				`[data-highlight-id="${editHighlightId}"]`
			);
			spans.forEach((span) => {
				if (span && span.parentNode) {
					span.textContent = newText;
				}
			});
		}

		if (editHighlight.type === "table") {
			const sections = contentRef.current.querySelectorAll(
				`[data-highlight-id="${editHighlightId}"]`
			);

			if (sections[0] && sections[0].parentNode) {
				//console.log(newText)
				sections[0].innerHTML = newText;
				//sections[0].append(newText);
			}
		}
		if (editHighlight.type === "image") {
			//console.log(newText);

			const div = contentRef.current.querySelectorAll(
				`[data-highlight-id="${editHighlightId}"]`
			);

			if (div[0] && div[0].parentNode) {
				// console.log(newText)
				div[0].innerHTML = newText;
				//sections[0].append(newText);
			}
		}

		// console.log(updatedHighlights);
		saveHighlights(updatedHighlights, contentRef.current.innerHTML);
		setEditHighlight("");
		setEditInitialText("");
		setAddLabel(false);
		setIsMultiple(false);
		setIsModalOpen(false);
	};

	const handleRemoveHighlight = (id) => {
		const updatedHighlights = highlights.filter(
			(highlight) => highlight.id !== id
		);

		const highlightToRemove = highlights.find(
			(highlight) => highlight.id === id
		);

		console.log(highlightToRemove);

		setHighlights(updatedHighlights);

		if (highlightToRemove?.type === "text") {
			const spans = contentRef.current.querySelectorAll(
				`[data-highlight-id="${id}"]`
			);
			//console.log(spans);
			spans.forEach((span) => {
				if (span && span.parentNode) {
					const textNode = document.createTextNode(span.textContent);
					//console.log(textNode);
					span.parentNode.replaceChild(textNode, span);
				}
			});
		}

		if (highlightToRemove?.type === "table") {
			const section = contentRef.current.querySelector(
				`section[data-highlight-id="${id}"]`
			);

			if (section) {
				// Get the parent of the section
				const parent = section.parentNode;

				// Move all child nodes of the section to the parent node
				while (section.firstChild) {
					parent.insertBefore(section.firstChild, section);
				}

				// Remove the section element
				parent.removeChild(section);
			}
		}

		if (highlightToRemove?.type === "image") {
			const div = contentRef.current.querySelector(
				`div[data-highlight-id="${id}"]`
			);

			if (div) {
				// Get the parent of the section
				const parent = div.parentNode;
				// Move all child nodes of the section to the parent node
				while (div.firstChild) {
					parent.insertBefore(div.firstChild, div);
				}
				// Remove the section element
				parent.removeChild(div);
			}
		}
		// saveHighlights(updatedHighlights, contentRef.current.innerHTML);
		deleteHighlights(id, contentRef.current.innerHTML);
	};

	const deleteHighlights = async (highlightId, content) => {
		try {
			const response = await deleteHighlight(
				templateId,
				highlightId,
				content
			);
			if (response) {
				setConversionStatus(content);
				setNewHighlight({
					id: "",
					text: "",
					label: "",
					type: "",
					name: "",
					multi: false,
				});
				setSearchText("");
			}
		} catch (error) {
			console.error("Failed to delete highlights", error);
		}
	};
	const confirmReset = () => {
		setIsResetAll(false);
		handleRemoveAllHighlights();
	};

	const handleRemoveAllHighlights = () => {
		highlights.forEach((highlight) => {
			if (highlight?.type === "text") {
				const spans = contentRef.current.querySelectorAll(
					`[data-highlight-id="${highlight.id}"]`
				);
				spans.forEach((span) => {
					if (span && span.parentNode) {
						const textNode = document.createTextNode(
							span.textContent
						);
						//console.log(textNode);
						span.parentNode.replaceChild(textNode, span);
					}
				});
			}

			if (highlight?.type === "table") {
				const section = contentRef.current.querySelector(
					`section[data-highlight-id="${highlight.id}"]`
				);
				if (section) {
					// Get the parent of the section
					const parent = section.parentNode;
					// Move all child nodes of the section to the parent node
					while (section.firstChild) {
						parent.insertBefore(section.firstChild, section);
					}
					// Remove the section element
					parent.removeChild(section);
				}
			}

			if (highlight?.type === "image") {
				const div = contentRef.current.querySelector(
					`div[data-highlight-id="${highlight.id}"]`
				);
				if (div) {
					// Get the parent of the section
					const parent = div.parentNode;
					// Move all child nodes of the section to the parent node
					while (div.firstChild) {
						parent.insertBefore(div.firstChild, div);
					}
					// Remove the section element
					parent.removeChild(div);
				}
			}
		});

		setHighlights([]);
		saveHighlights([], contentRef.current.innerHTML);
	};

	const handleSaveDocumentName = () => {
		setIsEditingFileName(false);
		saveHighlights(highlights, contentRef.current.innerHTML);
	};

	const saveHighlights = async (updatedHighlights, content) => {
		try {
			setIsLoading(true);
			const updatedObj = {
				highlights: updatedHighlights,
				content,
				fileName,
			};
			const response = await saveOrUpdateHighlights(
				templateId,
				updatedObj
			);

			if (response) {
				setIsLoading(false);
				setConversionStatus(content);
				setNewHighlight({
					id: "",
					text: "",
					label: "",
					name: "",
					type: "",
					multi: false,
				});
				setSearchText("");
			}
			fetchLabels(projectId);
		} catch (error) {
			console.error("Failed to save highlights", error);
		}
	};

	const reloadContent = async () => {
		const response = await getTemplatesById(projectId, id);
		contentRef.current.innerHTML = response.content;
		setIsContentTouched(false);
	};

	const handleSaveTemplateContent = async () => {
		try {
			const content = contentRef.current.innerHTML;
			setIsLoading(true);
			const updatedObj = {
				content,
			};
			const response = await saveTemplateContent(templateId, updatedObj);

			if (response) {
				setIsLoading(false);
				setConversionStatus(content);
				setNewHighlight({
					id: "",
					text: "",
					label: "",
					name: "",
					type: "",
					multi: false,
				});
				setSearchText("");
			}
			setIsContentTouched(false);
		} catch (error) {
			console.error("Failed to save highlights", error);
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setNewHighlight((prevState) => ({
			...prevState,
			[name]: value,
			id: prevState.id || generateHighlightId(),
		}));
	};

	// Need to check if parent node has same data-hightlight-Id
	const highlightText = (text, query) => {
		//console.log(text,"-------------",query);
		if (!query) return text;

		const regex = new RegExp(`(${query})`, "g");
		return text.replace(
			regex,
			`<span class="highlight hightlightcolor" data-highlight-id="${highlightName}" >$1</span>`
		);
	};

	const handleImageClick = () => {
		setAddTable(false);
		setAddImage(true);
		setIsMultiple(false);
		setAddLabel(false);
	};

	const handleTableClick = () => {
		setAddTable(true);
		setAddImage(false);
		setIsMultiple(false);
		setAddLabel(false);
	};
	const handleTextClick = () => {
		setAddTable(false);
		setAddImage(false);
		setIsMultiple(false);
		setAddLabel(true);

		// Generate a new id for the highlight
		const highlightId = generateHighlightId();
		setNewHighlight({
			id: highlightId,
			text: "",
			label: "",
			name: highlightId,
			type: "text",
			multi: isMultiple,
		});
	};

	const handleSearchChange = (event) => {
		if (addLabel) {
			// setConversionStatus(contentRef.current.innerHTML);
			setSearchText(newHighlight.text);
		}
	};

	const handleDocumentEdit = () => {
		setEditTemplate(true);
		setRightSectionVisible(false);
	};
	const highlightedText = highlightText(conversionStatus, searchText);

	return (
		<div>
			<div className="w-full p-2">
				<div>
					<div className="flex justify-end">
						<button
							onClick={() => {
								if (editTemplate && isContentTouched) {
									setIsAlertOpen(true);
									setAlertText(
										"Please Save or Cancel your changes before leaving edit mode."
									);
									return;
								}
								setEditTemplate(!editTemplate);
								setRightSectionVisible(!rightSectionVisible);
							}}
							className="px-4 py-2 text-center text-white bg-blue-500 hover:bg-blue-500 hover:text-white focus:bg-blue-500 focus:text-white rounded-md" // Updated class
						>
							{rightSectionVisible
								? ">> Click here to Edit Template"
								: ">> Click here to Label Templates"}
						</button>
					</div>
					<div className="w-full p-2">
						{!rightSectionVisible && (
							<StyleComponents
								handleSave={handleSaveTemplateContent}
								handleCancel={reloadContent}
								content={contentRef}
							/>
						)}
					</div>
				</div>
				<div className="w-full flex">
					<div
						ref={contentRef}
						onMouseUp={handleTextHighlight}
						onKeyUp={handleContentChange}
						dangerouslySetInnerHTML={{ __html: highlightedText }}
						id="neoDocView"
						className={`custom-content ${
							rightSectionVisible ? "adjust-width mr-4" : ""
						}`}
						contentEditable={editTemplate}
						style={{
							cursor: "text",
							height: "calc(100vh - 155px)",
							overflowY: "auto",
						}}
					></div>

					{isLoading && (
						<div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50">
							<div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
						</div>
					)}
					{rightSectionVisible && (
						<div className="w-2/5">
							<div className=" h-[calc(100vh-64px)] overflow-y-auto bg-white shadow-lg rounded-lg">
								<>
									<div className="flex">
										{/* Label Templates Button */}
										<span className="w-full">
											<button className="w-full py-2 text-center text-black bg-blue-400 hover:bg-blue-300 hover:focus:bg-blue-500 focus:text-white rounded-r-md">
												Label Templates
											</button>
										</span>
									</div>
								</>

								{editTemplate ? (
									<StyleComponents
										handleSave={handleSaveTemplateContent}
										content={contentRef}
									/>
								) : (
									<>
										<div className="flex flex-col p-4">
											{isEditingFileName ? (
												<input
													type="text"
													className="text-xl font-bold border border-gray-300 p-2 rounded w-full"
													value={fileName}
													onChange={
														handleFileNameChange
													}
													onBlur={() =>
														handleSaveDocumentName()
													}
													autoFocus
												/>
											) : (
												<div className="flex items-center mb-2">
													<h2 className="text-xl font-bold">
														{fileName}
													</h2>
													<button
														className="ml-2 p-1 rounded hover:bg-blue-100"
														onClick={() =>
															setIsEditingFileName(
																true
															)
														}
														title="Edit"
													>
														<PencilIcon className="h-5 w-5 text-blue-500" />
													</button>
												</div>
											)}
											<div className="addbutton">
												<button
													className={`px-3 py-2 text-sm mr-2 rounded-md border  ${
														addLabel
															? "bg-indigo-600 text-white"
															: "bg-white-400 text-gray-600"
													}`}
													onClick={handleTextClick}
												>
													+ Add Text
												</button>
												<button
													className={`px-3 py-2 text-sm mr-2 rounded-md border ${
														addTable
															? "bg-indigo-600 text-white"
															: "bg-white-400 text-gray-600"
													}`}
													onClick={handleTableClick}
												>
													+ Add Table
												</button>
												<button
													className={`px-3 py-2 text-sm rounded-md border ${
														addImage
															? "bg-indigo-600 text-white"
															: "bg-white-400 text-gray-600"
													}`}
													onClick={handleImageClick}
												>
													+ Add Image
												</button>
											</div>
										</div>

										<div className="space-y-4">
											{addLabel && (
												<>
													<div className="flex space-x-2 px-2">
														{/*    <div className='flex border rounded-md px-2 py-2'>
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
                                readOnly
                              />
                            </div> */}
														<LabelsComponent
															newHighlight={
																newHighlight
															}
															handleInputChange={
																handleInputChange
															}
															existingLabels={
																highlights
															} // Pass the full array, not just label names
															labelType="text"
														/>
													</div>

													<div className="flex space-x-2 px-2">
														<div className="border rounded-md flex w-full jusify-left">
															<div
																className="px-2"
																style={{
																	display:
																		addLabel
																			? "block"
																			: "none",
																}}
															>
																<input
																	type="checkbox"
																	onChange={
																		handleSearchChange
																	}
																	className="search-input p-2 border rounded"
																	value={
																		isMultiple
																	}
																	disabled={
																		!(
																			newHighlight.label !==
																				"" &&
																			newHighlight.text !==
																				"" &&
																			newHighlight.id
																		)
																	}
																/>{" "}
																Multi
															</div>
														</div>
														<div className="justify-items-end flex w-full">
															<button
																className="bg-gray-100 text-black px-4 mr-2 py-1 rounded"
																onClick={() =>
																	cancelSaveLabel()
																}
															>
																Cancel
															</button>
															<button
																className={`px-4 py-1 rounded ${
																	(newHighlight.label !==
																		"" ||
																		newHighlight.label) &&
																	(newHighlight.text !==
																		"" ||
																		newHighlight.text) &&
																	newHighlight.id
																		? "bg-indigo-600 text-white"
																		: "bg-gray-400 text-gray-600 cursor-not-allowed"
																}`}
																onClick={() =>
																	saveLabel()
																}
																disabled={
																	!(
																		newHighlight.label !==
																			"" &&
																		newHighlight.text !==
																			"" &&
																		newHighlight.id
																	)
																}
															>
																Save
															</button>
														</div>
													</div>
												</>
											)}
											{addTable && (
												<>
													<div className="flex space-x-2 px-2">
														<div className="flex py-2 px-2 rounded-md border w-full">
															{/* <input
                                type='text'
                                placeholder='Label'
                                name='label'
                                className='w-full border border-gray-300 p-2 rounded'
                                value={newHighlight.label}
                                onChange={handleInputChange}
                              />
                              <input
                                type='text'
                                placeholder='Value'
                                hidden
                                name='text'
                                className='w-full border border-gray-300 p-2 rounded'
                                value={newHighlight.text}
                                onChange={handleInputChange}
                              />*/}
															<LabelsComponent
																newHighlight={
																	newHighlight
																}
																handleInputChange={
																	handleInputChange
																}
																existingLabels={
																	existingLabels?.table ||
																	[]
																}
																labelType="table"
															/>
														</div>
													</div>
													<div className="flex space-x-2 justify-end px-4">
														<button
															className="bg-gray-300 text-black px-4 py-1 rounded"
															onClick={() =>
																cancelSaveLabel()
															}
														>
															Cancel
														</button>
														<button
															className={`px-4 py-1 rounded ${
																(newHighlight.label !==
																	"" ||
																	newHighlight.label) &&
																(newHighlight.text !==
																	"" ||
																	newHighlight.text) &&
																newHighlight.id
																	? "bg-indigo-600 text-white"
																	: "bg-gray-400 text-gray-600 cursor-not-allowed"
															}`}
															onClick={() =>
																saveLabel()
															}
															disabled={
																!(
																	newHighlight.label !==
																		"" &&
																	newHighlight.text !==
																		"" &&
																	newHighlight.id
																)
															}
														>
															Save
														</button>
													</div>
												</>
											)}

											{addImage && (
												<>
													<div className="flex space-x-2 px-2">
														<div className="flex border rounded-md px-2 py-2 w-full">
															{/*    <input
                                type='text'
                                placeholder='Label'
                                name='label'
                                className='w-full border border-gray-300 p-2 rounded'
                                value={newHighlight.label}
                                onChange={handleInputChange}
                              />
                              <input
                                type='text'
                                placeholder='Value'
                                hidden
                                name='text'
                                className='w-full border border-gray-300 p-2 rounded'
                                value={newHighlight.text}
                                onChange={handleInputChange}
                              />*/}
															<LabelsComponent
																newHighlight={
																	newHighlight
																}
																handleInputChange={
																	handleInputChange
																}
																existingLabels={
																	existingLabels?.image ||
																	[]
																}
																labelType="image"
															/>
														</div>
													</div>
													<div className="flex space-x-2 justify-end px-4">
														<button
															className="bg-gray-300 text-black px-4 py-1 rounded"
															onClick={() =>
																cancelSaveLabel()
															}
														>
															Cancel
														</button>
														<button
															className={`px-4 py-1 rounded ${
																(newHighlight.label !==
																	"" ||
																	newHighlight.label) &&
																(newHighlight.text !==
																	"" ||
																	newHighlight.text) &&
																newHighlight.id
																	? "bg-indigo-600 text-white"
																	: "bg-gray-400 text-gray-600 cursor-not-allowed"
															}`}
															onClick={() =>
																saveImageLabel()
															}
															disabled={
																!(
																	newHighlight.label !==
																		"" &&
																	newHighlight.text !==
																		"" &&
																	newHighlight.id
																)
															}
														>
															Save
														</button>
													</div>
												</>
											)}
											<div className="space-y-2 max-h-80 overflow-y-auto">
												<div className="flex justify-between items-center">
													<table className="min-w-full divide-y">
														<thead className="bg-gray-100">
															<tr>
																<th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
																	Label
																</th>
																<th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
																	Value
																</th>
																<th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
																	Action
																</th>
															</tr>
														</thead>
														<tbody>
															{highlights.map(
																(
																	highlight,
																	index
																) => (
																	<tr
																		key={
																			highlight.id
																		}
																		className={
																			index %
																				2 ===
																			0
																				? "bg-white"
																				: "bg-gray-50"
																		}
																	>
																		<td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
																			<a
																				href={`#${highlight.id}`}
																				className="text-gray-600 hover:text-blue-800"
																			>
																				{
																					highlight.label
																				}
																			</a>
																		</td>
																		<td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
																			<a
																				href={`#${highlight.id}`}
																				className="text-gray-600 hover:text-blue-800"
																			>
																				{highlight.type ===
																				"text" ? (
																					highlight.text
																				) : highlight.type ===
																				  "image" ? (
																					<img
																						src={
																							image
																						}
																						alt="/"
																					/>
																				) : highlight.type ===
																				  "table" ? (
																					<img
																						src={
																							table
																						}
																						alt="/"
																					/>
																				) : (
																					""
																				)}
																			</a>
																		</td>
																		<td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
																			<div className="flex items-center space-x-2">
																				<button
																					onClick={() =>
																						handleEditHighlight(
																							highlight.id
																						)
																					}
																					className="p-1 rounded hover:bg-blue-100"
																					title="Edit"
																				>
																					<PencilIcon className="h-4 w-4 text-blue-500" />
																				</button>
																				<button
																					onClick={() =>
																						handleRemoveHighlight(
																							highlight.id
																						)
																					}
																					className="p-1 rounded hover:bg-red-100 ml-2"
																					title="Remove"
																				>
																					<TrashIcon className="h-4 w-4 text-red-500" />
																				</button>
																			</div>
																		</td>
																	</tr>
																)
															)}
														</tbody>
													</table>
												</div>
											</div>
											<div className="flex justify-between p-4 mt-4">
												<button
													className="border border-blue-600 text-blue-600 px-4 py-2 rounded"
													onClick={() =>
														setIsResetAll(true)
													}
												>
													Reset All
												</button>

												<button
													className="hidden px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
													onClick={handleBack}
												>
													<ArrowLeftIcon className="w-5 h-5 inline-block mr-2" />{" "}
													Back
												</button>
												<button
													className="bg-indigo-600 text-white px-2 rounded flex items-center"
													onClick={handleBack}
												>
													<SaveIcon className="h-4 w-4 mr-1" />{" "}
													Save
												</button>
											</div>
										</div>
									</>
								)}
							</div>
						</div>
					)}
				</div>

				<EditModal
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					onSave={handleSaveHighlight}
					editHighlight={editHighlight}
					initialText={editInitialText}
					label={editHighlight.label}
				/>
			</div>
			<NeoModal
				isOpen={isAlertOpen}
				onClose={() => setIsAlertOpen(false)}
			>
				<div className="bg-white p-6 rounded-lg  max-w-sm mx-auto ">
					<p className="text-gray-800 text-lg font-semibold mb-4">
						{alertText}
					</p>
					<div className="flex justify-center">
						<button
							className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
							onClick={() => setIsAlertOpen(false)}
						>
							Close
						</button>
					</div>
				</div>
			</NeoModal>

			<NeoModal isOpen={isResetAll} onClose={() => setIsResetAll(false)}>
				{highlights.length > 0 ? (
					<div className="p-6 bg-white rounded-lg shadow-lg max-w-sm mx-auto">
						<h4 className="text-lg font-semibold text-center mb-4">
							Reset All
						</h4>
						<p className="text-center mb-6">
							Are you sure? Do you wish to reset all highlights?
						</p>
						<div className="flex justify-center space-x-4">
							<button
								className="inline-flex justify-center px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-transparent rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
								onClick={() => setIsResetAll(false)}
							>
								Cancel
							</button>
							<button
								className="inline-flex justify-center px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
								onClick={() => confirmReset()}
							>
								Yes
							</button>
						</div>
					</div>
				) : (
					<div className="p-6 bg-white rounded-lg shadow-lg max-w-sm mx-auto">
						<h4 className="text-lg font-semibold text-center mb-4">
							No Highlights to Reset
						</h4>
						<div className="flex justify-center">
							<button
								className="inline-flex justify-center px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
								onClick={() => setIsResetAll(false)}
							>
								Close
							</button>
						</div>
					</div>
				)}
			</NeoModal>
		</div>
	);
}

export default DocxToTextConverter;
