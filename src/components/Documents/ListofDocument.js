import React from 'react'
import { useLocation } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { FaImage, FaTable } from 'react-icons/fa';

const ListofDocuments = () => {
  const location = useLocation();
  const data = location.state?.data;
  const columns = [
    {
      name: 'File Name',
      selector: row => row.fileName,
      sortable: true,
    },
    ...data[0].highlights.map((highlight, index) => ({
      name: highlight.label,
      selector: row => {
        const highlightItem = row.highlights[index];
        if (highlightItem?.type === 'image') {
          return <FaImage />;
        } else if (highlightItem?.type === 'table') {
          return <FaTable />;
        } else {
          return highlightItem?.text || '';
        }
      },
      sortable: true,
    })),
  ];

  return (
    <DataTable
      title="Document List"
      columns={columns}
      data={data}
      pagination
      highlightOnHover
    />
  );
};

  
export default ListofDocuments