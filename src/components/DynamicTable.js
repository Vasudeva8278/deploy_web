import React, { useState, useEffect, useRef } from 'react';

const DynamicTable = ({ initialTableHtml }) => {
  const [table, setTable] = useState();
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, cell: null });
  const [copiedRow, setCopiedRow] = useState(null);
  const [copiedColumn, setCopiedColumn] = useState(null);
  const [selectionMode, setSelectionMode] = useState(null);
  const tableRef = useRef();

  useEffect(() => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = initialTableHtml;

    const tableElement = tempDiv.querySelector('table');
    const tableStyle = tableElement.getAttribute('style') || '';
    const tableClass = tableElement.getAttribute('class') || '';

    const rows = Array.from(tempDiv.querySelectorAll('tr')).map(tr => {
      const trStyle = tr.getAttribute('style') || '';
      const trClass = tr.getAttribute('class') || '';

      const cells = Array.from(tr.querySelectorAll('td, th')).map(td => ({
        content: td.innerHTML,
        style: td.getAttribute('style') || '',
        className: td.getAttribute('class') || '',
        colSpan: Number(td.getAttribute('colSpan')) || 1,
        rowSpan: Number(td.getAttribute('rowSpan')) || 1,
      }));

      return { trStyle, trClass, cells };
    });

    setTable({ rows, tableStyle, tableClass });
  }, [initialTableHtml]);

  const parseStyle = (styleString) => {
    return styleString.split(';').reduce((acc, style) => {
      const [key, value] = style.split(':');
      if (key && value) {
        acc[key.trim()] = value.trim();
      }
      return acc;
    }, {});
  };

  const createEmptyCell = (cell) => ({
    content: '',
    style: cell.style,
    className: cell.className,
    colSpan: cell.colSpan,
    rowSpan: cell.rowSpan,
  });

  const createEmptyRow = (rowData) => ({
    trStyle: rowData.trStyle,
    trClass: rowData.trClass,
    cells: rowData.cells.map(createEmptyCell)
  });

  const createEmptyColumn = (columnData) => {
    return columnData.map(cell => createEmptyCell(cell));
  };

  const copyRowStructure = (rowData) => ({
    trStyle: rowData.trStyle,
    trClass: rowData.trClass,
    cells: rowData.cells.map(createEmptyCell)
  });

  const copyColumnStructure = (colIndex) => {
    return table.rows.map(row => {
      const cell = row.cells.find((_, index) => index === colIndex);
      return cell ? createEmptyCell(cell) : null;
    }).filter(cell => cell !== null);
  };

  const insertRow = (index, rowStructure) => {
   // console.log("index, rowStructure",index, rowStructure)
    const newRows = [...table.rows];
    const newRow = rowStructure || {
      trStyle: '',
      trClass: '',
      cells: Array(newRows[0].cells.length).fill().map(createEmptyCell)
    };

    for (let i = 0; i < index; i++) {
      newRows[i].cells = newRows[i].cells.map((cell) => {
        if (cell.rowSpan > 1 && i + cell.rowSpan > index) {
          return { ...cell, rowSpan: cell.rowSpan + 1 };
        }
        return cell;
      });
    }

    newRows.splice(index, 0, newRow);

    let colIndex = 0;
    for (let i = index - 1; i >= 0 && colIndex < newRow.cells.length; i--) {
      newRows[i].cells.forEach((cell) => {
        if (cell.rowSpan > 1 && i + cell.rowSpan > index) {
          newRow.cells.splice(colIndex, 1);
        } else {
          colIndex += cell.colSpan;
        }
      });
    }

    setTable({ ...table, rows: newRows });
    resetSelection();
  };

  const insertColumn = (index, columnStructure) => {
  //  console.log(JSON.stringify(columnStructure));
    const updatedRows = table.rows.map((row, rowIndex) => {
      const updatedCells = [];
      let currentCol = 0;
      let inserted = false;
      const rowSpanTracker = {};
  
      for (let i = 0; i < row.cells.length; i++) {
        const cell = row.cells[i];

        if (rowSpanTracker[currentCol]) {
          rowSpanTracker[currentCol]--;
          if (rowSpanTracker[currentCol] === 0) {
            delete rowSpanTracker[currentCol];
          }
          currentCol += cell.colSpan;
          updatedCells.push(cell);
          continue;
        }
  
        if (currentCol === index && !inserted) {
          const newCell = columnStructure ? columnStructure[rowIndex] : createEmptyCell(cell);
          updatedCells.push(newCell);
          inserted = true;
        }
  
        if (currentCol < index && currentCol + cell?.colSpan > index) {
          const beforeColSpan = index - currentCol;
          const afterColSpan = cell.colSpan - beforeColSpan;
  
          updatedCells.push({ ...cell, colSpan: beforeColSpan });
          const newCell = columnStructure ? columnStructure[rowIndex] : createEmptyCell(cell);
          updatedCells.push(newCell);
          updatedCells.push({ ...cell, colSpan: afterColSpan });
          inserted = true;
        } else {
          updatedCells.push(cell);
        }
  
        if (cell?.rowSpan > 1) {
          rowSpanTracker[currentCol] = cell.rowSpan - 1;
        }
        currentCol += cell?.colSpan;
      }
  
      if (!inserted) {
        const newCell = columnStructure ? columnStructure[rowIndex] : createEmptyCell(row?.cells[row?.cells?.length - 1]);
        updatedCells.push(newCell);
      }
  
      return { ...row, cells: updatedCells };
    });
  
    setTable({ ...table, rows: updatedRows });
    resetSelection();
  };

  const removeRow = (index) => {
    if (table.rows.length > 1) {
      const newRows = [...table.rows];
      newRows.splice(index, 1);

      // Adjust rowspan for cells above the removed row
      for (let i = 0; i < index; i++) {
        newRows[i].cells = newRows[i].cells.map(cell => {
          if (cell.rowSpan > 1 && i + cell.rowSpan > index) {
            return { ...cell, rowSpan: cell.rowSpan - 1 };
          }
          return cell;
        });
      }

      setTable({ ...table, rows: newRows });
    }
  };

  const removeColumn = (index) => {
    if (table.rows[0].cells.length > 1) {
      const updatedRows = table.rows.map(row => {
        const updatedCells = [];
        let currentCol = 0;

        for (let i = 0; i < row.cells.length; i++) {
          const cell = row.cells[i];
          if (currentCol === index) {
            // Skip cell to remove column
            currentCol += cell.colSpan;
          } else {
            updatedCells.push(cell);
            currentCol += cell.colSpan;
          }
        }

        return { ...row, cells: updatedCells };
      });

      setTable({ ...table, rows: updatedRows });
    }
  };

  const handleContextMenu = (event, rowIndex, colIndex) => {
    event.preventDefault();
    const cellRect = event.target.getBoundingClientRect();
    const cell = {
      row: rowIndex,
      col: colIndex,
      cellData: table.rows[rowIndex].cells[colIndex],
    };
    setContextMenu({
      visible: true,
      x: cellRect.right,
      y: cellRect.bottom,
      cell: cell,
    });
  };

  const handleClick = () => {
    setContextMenu({ visible: false, x: 0, y: 0, cell: null });
  };

  const resetSelection = () => {
    setCopiedRow(null);
    setCopiedColumn(null);
    setSelectionMode(null);
  };

  const contextMenuOptions = {
    copyRow: () => {
      setCopiedRow(copyRowStructure(table.rows[contextMenu.cell.row]));
      setSelectionMode('row');
      setContextMenu({ ...contextMenu, visible: false });
    },
    copyColumn: () => {
      setCopiedColumn(copyColumnStructure(contextMenu.cell.col));
      setSelectionMode('column');
      setContextMenu({ ...contextMenu, visible: false });
    },
    pasteRowBefore: () => {
      if (copiedRow) {
        insertRow(contextMenu.cell.row, copiedRow);
        setContextMenu({ visible: false, x: 0, y: 0, cell: null });
      }
    },
    pasteRowAfter: () => {
      if (copiedRow) {
        insertRow(contextMenu.cell.row + 1, copiedRow);
        setContextMenu({ visible: false, x: 0, y: 0, cell: null });
      }
    },
    pasteColumnBefore: () => {
      if (copiedColumn) {
        insertColumn(contextMenu.cell.col, copiedColumn);
        setContextMenu({ visible: false, x: 0, y: 0, cell: null });
      }
    },
    pasteColumnAfter: () => {
      if (copiedColumn) {
        insertColumn(contextMenu.cell.col + 1, copiedColumn);
        setContextMenu({ visible: false, x: 0, y: 0, cell: null });
      }
    },
    clearSelection: () => {
      resetSelection();
      setContextMenu({ visible: false, x: 0, y: 0, cell: null });
    },
    insertRowBefore: () => {
      insertRow(contextMenu.cell.row,copyRowStructure(table.rows[contextMenu.cell.row]));
      setContextMenu({ visible: false, x: 0, y: 0, cell: null });
    },
    insertRowAfter: () => {
      insertRow(contextMenu.cell.row + 1,copyRowStructure(table.rows[contextMenu.cell.row]));
      setContextMenu({ visible: false, x: 0, y: 0, cell: null });
    },
    deleteRow: () => {
      removeRow(contextMenu.cell.row);
      setContextMenu({ visible: false, x: 0, y: 0, cell: null });
    },
    insertColumnBefore: () => {
      insertColumn(contextMenu.cell.col);
      setContextMenu({ visible: false, x: 0, y: 0, cell: null });
    },
    insertColumnAfter: () => {
      insertColumn(contextMenu.cell.col + 1);
      setContextMenu({ visible: false, x: 0, y: 0, cell: null });
    },
    deleteColumn: () => {
      removeColumn(contextMenu.cell.col);
      setContextMenu({ visible: false, x: 0, y: 0, cell: null });
    },
  };

  // Handle clicks outside the table
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (tableRef.current && !tableRef.current.contains(event.target)) {
        setContextMenu({ visible: false, x: 0, y: 0, cell: null });
        setCopiedRow(null);
        setCopiedColumn(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  return (
    <div className="bg-gray-100 p-8 overflow-y" id="dynamicTable" onClick={handleClick} ref={tableRef}>
      <table
        contentEditable="true"
        className={table?.tableClass}
        style={table?.tableStyle ? parseStyle(table.tableStyle) : {}}
      >
        <tbody>
          {table?.rows?.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              style={row.trStyle ? parseStyle(row.trStyle) : {}}
              className={row?.trClass}
            >
              {row.cells.map((cell, colIndex) => (
                <td
                  key={colIndex}
                  style={cell?.style ? parseStyle(cell.style) : {}}
                  className={cell?.className}
                  colSpan={cell?.colSpan}
                  rowSpan={cell?.rowSpan}
                  onContextMenu={(e) => handleContextMenu(e, rowIndex, colIndex)}
                  dangerouslySetInnerHTML={{ __html: cell?.content }}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {contextMenu.visible && (
        <div
        className="context-menu absolute bg-white border border-gray-300 shadow-lg"
        style={{ top: contextMenu.y, left: contextMenu.x }}
      >
        {Object.keys(contextMenuOptions).map((option) => {
          if (selectionMode === 'row') {
            if (option === 'clearSelection' || option.startsWith('pasteRow')) {
              return (
                <div
                  key={option}
                  className="context-menu-item p-2 hover:bg-gray-200 cursor-pointer"
                  onClick={() => contextMenuOptions[option]()}
                >
                  {option.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                </div>
              );
            }
          } else if (selectionMode === 'column') {
            if (option === 'clearSelection' || option.startsWith('pasteColumn')) {
              return (
                <div
                  key={option}
                  className="context-menu-item p-2 hover:bg-gray-200 cursor-pointer"
                  onClick={() => contextMenuOptions[option]()}
                >
                  {option.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                </div>
              );
            }
          } else {
            if (!option.startsWith('paste')) {
              return (
                <div
                  key={option}
                  className="context-menu-item p-2 hover:bg-gray-200 cursor-pointer"
                  onClick={() => contextMenuOptions[option]()}
                >
                  {option.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                </div>
              );
            }
          }
          return null;
        })}
      </div>
      )}
      <h4> {copiedRow || copiedColumn ? "* Right Click to Paste Row/Column " : "* Right click for Context Menu (to Add/Delete - Row/Column)"} </h4>
    </div>
  );
};

export default DynamicTable;