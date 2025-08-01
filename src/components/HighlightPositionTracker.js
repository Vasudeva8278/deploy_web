import React, { useState, useEffect } from 'react';

const HighlightPositionTracker = ({ highlights, contentRef, setHighlights, setIsContentTouched, saveHighlights }) => {
	const [highlightPositions, setHighlightPositions] = useState({});
	const [showSelectionBoxes, setShowSelectionBoxes] = useState(false);

	// Function to track highlight positions
	const trackHighlightPositions = () => {
		if (!contentRef.current || !highlights || highlights.length === 0) {
			alert('No highlights found to track positions.');
			return;
		}
		
		const positions = {};
		const contentDiv = contentRef.current;
		
		highlights.forEach(highlight => {
			// Find elements with matching highlight ID or label
			const elements = contentDiv.querySelectorAll(`[data-highlight-id="${highlight.id}"], [data-label="${highlight.label}"], [data-selected-label="true"]`);
			
			elements.forEach((element, index) => {
				const rect = element.getBoundingClientRect();
				const parentRect = contentDiv.getBoundingClientRect();
				
				positions[highlight.id] = {
					...highlight,
					position: {
						left: rect.left - parentRect.left,
						top: rect.top - parentRect.top,
						width: rect.width,
						height: rect.height,
						element: element,
						index: index
					}
				};
			});
		});
		
		setHighlightPositions(positions);
		console.log('Tracked highlight positions:', positions);
		alert(`Tracked positions for ${Object.keys(positions).length} highlights!`);
	};

	// Function to show selection boxes for highlights
	const showSelectionBoxes = () => {
		if (!contentRef.current) {
			alert('No content found to show selection boxes.');
			return;
		}
		
		const contentDiv = contentRef.current;
		
		// Clear any existing selection boxes
		const existingBoxes = contentDiv.querySelectorAll('.highlight-selection-box');
		existingBoxes.forEach(box => box.remove());
		
		// Create selection boxes for each highlight
		highlights.forEach(highlight => {
			const elements = contentDiv.querySelectorAll(`[data-highlight-id="${highlight.id}"], [data-label="${highlight.label}"], [data-selected-label="true"]`);
			
			elements.forEach((element, index) => {
				const rect = element.getBoundingClientRect();
				const parentRect = contentDiv.getBoundingClientRect();
				
				const selectionBox = document.createElement('div');
				selectionBox.className = 'highlight-selection-box';
				selectionBox.style.cssText = `
					position: absolute;
					border: 3px solid #10b981;
					background: rgba(16, 185, 129, 0.1);
					border-radius: 6px;
					pointer-events: none;
					z-index: 1000;
					animation: highlightPulse 2s ease-in-out infinite;
				`;
				
				selectionBox.style.left = (rect.left - parentRect.left) + 'px';
				selectionBox.style.top = (rect.top - parentRect.top) + 'px';
				selectionBox.style.width = rect.width + 'px';
				selectionBox.style.height = rect.height + 'px';
				
				// Add pulse animation
				const style = document.createElement('style');
				style.textContent = `
					@keyframes highlightPulse {
						0% { transform: scale(1); opacity: 1; }
						50% { transform: scale(1.02); opacity: 0.8; }
						100% { transform: scale(1); opacity: 1; }
					}
				`;
				document.head.appendChild(style);
				
				contentDiv.style.position = 'relative';
				contentDiv.appendChild(selectionBox);
				
				// Add label to selection box
				const label = document.createElement('div');
				label.style.cssText = `
					position: absolute;
					top: -25px;
					left: 0;
					background: #10b981;
					color: white;
					padding: 2px 6px;
					border-radius: 4px;
					font-size: 11px;
					font-weight: 600;
					white-space: nowrap;
					z-index: 1001;
				`;
				label.textContent = highlight.label || highlight.name || 'Highlight';
				selectionBox.appendChild(label);
			});
		});
		
		setShowSelectionBoxes(true);
		console.log('Showing highlight selection boxes');
		alert('Highlight selection boxes displayed!');
	};

	// Function to clear selection boxes
	const clearSelectionBoxes = () => {
		if (!contentRef.current) return;
		
		const contentDiv = contentRef.current;
		const existingBoxes = contentDiv.querySelectorAll('.highlight-selection-box');
		existingBoxes.forEach(box => box.remove());
		
		setShowSelectionBoxes(false);
		console.log('Cleared highlight selection boxes');
		alert('Selection boxes cleared!');
	};

	// Function to apply right selection visible input box
	const applyRightSelectionInputBox = () => {
		if (!contentRef.current || !highlights || highlights.length === 0) {
			alert('No highlights found to create input panel.');
			return;
		}
		
		// Remove existing panel if any
		const existingPanel = document.getElementById('highlight-input-panel');
		if (existingPanel) {
			document.body.removeChild(existingPanel);
		}
		
		// Create a floating input panel on the right side
		const inputPanel = document.createElement('div');
		inputPanel.id = 'highlight-input-panel';
		inputPanel.style.cssText = `
			position: fixed;
			right: 20px;
			top: 100px;
			width: 300px;
			max-height: 80vh;
			background: white;
			border: 2px solid #3b82f6;
			border-radius: 8px;
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
			z-index: 2000;
			overflow-y: auto;
			padding: 16px;
		`;
		
		// Add header
		const header = document.createElement('div');
		header.style.cssText = `
			font-weight: 600;
			font-size: 16px;
			margin-bottom: 12px;
			color: #1f2937;
			border-bottom: 1px solid #e5e7eb;
			padding-bottom: 8px;
		`;
		header.textContent = '📝 Highlight Input Fields';
		inputPanel.appendChild(header);
		
		// Add close button
		const closeBtn = document.createElement('button');
		closeBtn.textContent = '✕';
		closeBtn.style.cssText = `
			position: absolute;
			top: 8px;
			right: 8px;
			background: none;
			border: none;
			font-size: 18px;
			cursor: pointer;
			color: #6b7280;
		`;
		closeBtn.onclick = () => {
			document.body.removeChild(inputPanel);
		};
		inputPanel.appendChild(closeBtn);
		
		// Create input fields for each highlight
		highlights.forEach((highlight, index) => {
			const inputContainer = document.createElement('div');
			inputContainer.style.cssText = `
				margin-bottom: 12px;
				padding: 8px;
				border: 1px solid #e5e7eb;
				border-radius: 6px;
				background: #f9fafb;
			`;
			
			// Label
			const label = document.createElement('div');
			label.style.cssText = `
				font-size: 12px;
				font-weight: 600;
				color: #374151;
				margin-bottom: 4px;
			`;
			label.textContent = highlight.label || highlight.name || `Highlight ${index + 1}`;
			inputContainer.appendChild(label);
			
			// Input field
			const input = document.createElement('input');
			input.type = 'text';
			input.value = highlight.text || '';
			input.style.cssText = `
				width: 100%;
				padding: 6px 8px;
				border: 1px solid #d1d5db;
				border-radius: 4px;
				font-size: 14px;
				background: white;
			`;
			
			// Handle input changes
			input.addEventListener('input', (e) => {
				const newValue = e.target.value;
				
				// Update highlight in state
				const updatedHighlights = highlights.map(h => {
					if (h.id === highlight.id) {
						return { ...h, text: newValue };
					}
					return h;
				});
				setHighlights(updatedHighlights);
				
				// Mark content as touched
				setIsContentTouched(true);
			});
			
			inputContainer.appendChild(input);
			inputPanel.appendChild(inputContainer);
		});
		
		// Add save button
		const saveBtn = document.createElement('button');
		saveBtn.textContent = '💾 Save All Changes';
		saveBtn.style.cssText = `
			width: 100%;
			padding: 8px 12px;
			background: #10b981;
			color: white;
			border: none;
			border-radius: 6px;
			font-weight: 600;
			cursor: pointer;
			margin-top: 12px;
		`;
		saveBtn.onclick = () => {
			saveHighlights(highlights, contentRef.current.innerHTML);
			alert('All highlight changes saved!');
		};
		inputPanel.appendChild(saveBtn);
		
		// Add to document
		document.body.appendChild(inputPanel);
		
		console.log('Applied right selection visible input box');
		alert('Highlight input panel created!');
	};

	return (
		<div style={{ marginBottom: 16, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
			<button
				onClick={trackHighlightPositions}
				style={{
					backgroundColor: '#10b981',
					color: 'white',
					border: 'none',
					padding: '8px 16px',
					borderRadius: '6px',
					cursor: 'pointer',
					fontSize: '14px',
					fontWeight: '500',
					transition: 'background-color 0.2s'
				}}
				onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
				onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
			>
				📍 Track Highlight Positions
			</button>
			
			<button
				onClick={showSelectionBoxes}
				style={{
					backgroundColor: '#f59e0b',
					color: 'white',
					border: 'none',
					padding: '8px 16px',
					borderRadius: '6px',
					cursor: 'pointer',
					fontSize: '14px',
					fontWeight: '500',
					transition: 'background-color 0.2s'
				}}
				onMouseEnter={(e) => e.target.style.backgroundColor = '#d97706'}
				onMouseLeave={(e) => e.target.style.backgroundColor = '#f59e0b'}
			>
				👁️ Show Selection Boxes
			</button>
			
			<button
				onClick={clearSelectionBoxes}
				style={{
					backgroundColor: '#ef4444',
					color: 'white',
					border: 'none',
					padding: '8px 16px',
					borderRadius: '6px',
					cursor: 'pointer',
					fontSize: '14px',
					fontWeight: '500',
					transition: 'background-color 0.2s'
				}}
				onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
				onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
			>
				❌ Clear Selection Boxes
			</button>
			
			<button
				onClick={applyRightSelectionInputBox}
				style={{
					backgroundColor: '#8b5cf6',
					color: 'white',
					border: 'none',
					padding: '8px 16px',
					borderRadius: '6px',
					cursor: 'pointer',
					fontSize: '14px',
					fontWeight: '500',
					transition: 'background-color 0.2s'
				}}
				onMouseEnter={(e) => e.target.style.backgroundColor = '#7c3aed'}
				onMouseLeave={(e) => e.target.style.backgroundColor = '#8b5cf6'}
			>
				📋 Apply Right Selection Input Box
			</button>
		</div>
	);
};

export default HighlightPositionTracker; 