import React from 'react';
import { useQuery } from 'react-query';
import { fetchPayments } from '../../services/api';

const PaymentList = () => {
  const orgId = localStorage.getItem('orgId');
  const { data: payments, error, isLoading } = useQuery(['payments', orgId], () => fetchPayments(orgId));

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading payments</div>;

  return (
    <div>
      <h3>Payments</h3>
      <ul>
        {payments.map(payment => (
          <li key={payment._id}>
            {payment.subscriptionPlan}: ${payment.amount} - {payment.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PaymentList;
