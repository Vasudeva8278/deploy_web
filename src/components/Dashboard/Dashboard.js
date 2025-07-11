import React, { useEffect, useState } from 'react';
import { getAllProjects } from '../../services/projectApi';
import SearchHeader from '../SearchHeader';
import Neo from '../Neo.jsx';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const projectsData = await getAllProjects();
        const formatted = projectsData.map(p => ({
          ...p,
          fileName: p.name || p.fileName,
          thumbnail: p.thumbnail || '',
          type: 'project',
        }));
        setProjects(formatted);
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
      <SearchHeader />
      <Neo />
      <h1 className='text-2xl font-bold mx-8'>Projects</h1>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div className="my-8 mx-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {projects.map((docObj) => (
            <div key={docObj._id} className="bg-white border border-gray-200 rounded-2xl shadow flex flex-col justify-between w-full h-[260px] p-4 relative transition hover:shadow-lg">
              {docObj.thumbnail && (
                <img
                  src={
                    docObj.thumbnail
                      ? (docObj.thumbnail.startsWith('data:image') || docObj.thumbnail.startsWith('http'))
                        ? docObj.thumbnail
                        : `data:image/png;base64,${docObj.thumbnail}`
                      : '/placeholder.png'
                  }
                  alt={docObj.fileName}
                  className="object-contain w-28 h-28 mb-4 rounded mx-auto"
                  style={{ maxWidth: '112px', maxHeight: '112px' }}
                  onError={e => { e.target.onerror = null; e.target.src = '/placeholder.png'; }}
                />
              )}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold truncate text-gray-800 mb-1">{docObj.fileName}</div>
                  <div className="text-xs text-gray-500 mb-2">Type: {docObj.type}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

