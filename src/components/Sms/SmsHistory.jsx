import React, { useState, useEffect } from 'react';
import { FaSms, FaCheckCircle, FaTimesCircle, FaClock, FaFilter } from 'react-icons/fa';
import { smsService } from '../../api/api';
import LoadingSpinner from '../Common/LoadingSpinner';

const SmsHistory = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    direction: '',
    phone: '',
  });

  useEffect(() => {
    fetchHistory();
  }, [filters]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.direction) params.direction = filters.direction;
      if (filters.phone) params.phone = filters.phone;
      
      const response = await smsService.history(params);
      setMessages(response.data.messages || []);
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
      received: { color: 'bg-blue-100 text-blue-800', icon: FaCheckCircle },
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

  const getDirectionBadge = (direction) => {
    const directionMap = {
      outgoing: { color: 'bg-purple-100 text-purple-800', label: 'Sortant' },
      incoming: { color: 'bg-indigo-100 text-indigo-800', label: 'Entrant' },
    };

    const Dir = directionMap[direction] || directionMap.outgoing;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${Dir.color}`}>
        {Dir.label}
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
        <button onClick={fetchHistory} className="btn-primary mt-4">Réessayer</button>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <FaSms className="text-green-500 mr-3" />
          Historique des SMS
        </h2>
        <span className="text-sm text-gray-500">{messages.length} message(s)</span>
      </div>

      {/* Filtres */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2 text-sm text-gray-700 mb-3">
          <FaFilter />
          <span className="font-medium">Filtres</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={filters.direction}
            onChange={(e) => setFilters(prev => ({ ...prev, direction: e.target.value }))}
            className="input-field w-auto min-w-[150px]"
          >
            <option value="">Tous les sens</option>
            <option value="outgoing">Sortants</option>
            <option value="incoming">Entrants</option>
          </select>
          <input
            type="text"
            placeholder="Filtrer par numéro"
            value={filters.phone}
            onChange={(e) => setFilters(prev => ({ ...prev, phone: e.target.value }))}
            className="input-field w-auto min-w-[200px]"
          />
          <button
            onClick={() => setFilters({ direction: '', phone: '' })}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FaSms className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Aucun SMS trouvé</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Direction</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Numéro</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {messages.map((msg) => (
                <tr key={msg.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    {getDirectionBadge(msg.direction)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {msg.phoneNumber}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                    {msg.message}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(msg.status)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : 'N/A'}
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

export default SmsHistory;