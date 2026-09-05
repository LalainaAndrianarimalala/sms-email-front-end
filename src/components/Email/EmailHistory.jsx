import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import { emailService } from '../../api/api';
import LoadingSpinner from '../Common/LoadingSpinner';

const EmailHistory = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const response = await emailService.list();
      setEmails(response.data.data || []);
    } catch (error) {
      setError('Erreur lors du chargement de l\'historique');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: FaClock },
      sent: { color: 'bg-green-100 text-green-800', icon: FaCheckCircle },
      failed: { color: 'bg-red-100 text-red-800', icon: FaTimesCircle },
    };

    const Status = statusMap[status] || statusMap.pending;
    const Icon = Status.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${Status.color}`}>
        <Icon className="mr-1" />
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center text-red-500">
        <p>{error}</p>
        <button onClick={fetchEmails} className="btn-primary mt-4">Réessayer</button>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <FaEnvelope className="text-blue-500 mr-3" />
          Historique des Emails
        </h2>
        <span className="text-sm text-gray-500">{emails.length} email(s)</span>
      </div>

      {emails.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FaEnvelope className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Aucun email envoyé</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sujet</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destinataire</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {emails.map((email) => (
                <tr key={email.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">
                    {email.subject}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                    {email.recipient}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(email.status)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {email.createdAt ? new Date(email.createdAt).toLocaleString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EmailHistory;