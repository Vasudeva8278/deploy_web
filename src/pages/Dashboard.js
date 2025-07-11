import React, { useEffect, useState } from 'react';
import TemplateCards from '../components/Template/TemplateCards';
import { getAllProjects } from '../services/projectApi';
import { getAllTemplates } from '../services/templateApi';
import { getAllDocuments } from '../services/documentApi';

const Dashboard = () => {
  const [templates, setTemplates] = useState([]);
  const [projects, setProjects] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [templatesData, projectsData, documentsData] = await Promise.all([
          getAllTemplates(),
          getAllProjects(),
          getAllDocuments(),
        ]);
        console.log('Templates:', templatesData);
        console.log('Projects:', projectsData);
        console.log('Documents:', documentsData);
        setTemplates(templatesData);
        setProjects(projectsData);
        setDocuments(documentsData);
      } catch (err) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div className="my-8">
        <h2 className="text-xl font-bold mb-2">Templates</h2>
        <TemplateCards documents={templates.map(t => ({
          ...t,
          fileName: t.name || t.fileName,
          thumbnail: t.thumbnail || '',
        }))} template={true} />
      </div>
      <div className="my-8">
        <h2 className="text-xl font-bold mb-2">Documents</h2>
        <TemplateCards documents={documents.map(d => ({
          ...d,
          fileName: d.name || d.fileName,
          thumbnail: d.thumbnail || '',
        }))} template={false} />
      </div>
      <div className="my-8">
        <h2 className="text-xl font-bold mb-2">Projects</h2>
        <TemplateCards documents={projects.map(p => ({
          ...p,
          fileName: p.name || p.fileName,
          thumbnail: p.thumbnail || '',
        }))} template={false} />
      </div>
    </div>
  );
};

export default Dashboard;

