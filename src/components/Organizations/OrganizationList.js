import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { fetchOrganizations } from '../../services/api';

const OrganizationList = () => {
  const { data: organizations, error, isLoading } = useQuery('organizations', fetchOrganizations);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading organizations</div>;

  return (
    <div>
      <h3>Organizations</h3>
      <Link to="/dashboard/organization/new">Create Organization</Link>
      <ul>
        {organizations.map(org => (
          <li key={org._id}>{org.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default OrganizationList;
