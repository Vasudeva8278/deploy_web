import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { createOrganization } from '../../services/api';

const OrganizationForm = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation(createOrganization, {
    onSuccess: () => {
      queryClient.invalidateQueries('organizations');
      navigate('/dashboard/organizations');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ name, description });
  };

  return (
    <div>
      <h3>Create Organization</h3>
      <form onSubmit={handleSubmit}>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" required></textarea>
        <button type="submit">Create</button>
      </form>
    </div>
  );
};

export default OrganizationForm;
