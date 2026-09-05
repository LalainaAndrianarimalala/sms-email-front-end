import React, { useState, useEffect } from 'react';
import { 
  FaSms, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaFilter, 
  FaSearch,
  FaDownload,
  FaEye,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
  FaPhone,
  FaUser,
  FaCalendar
} from 'react-icons/fa';
import { smsService } from '../../api/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import Toast from '../Common/Toast';

const SmsHistory = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    direction: '',
    status: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, [filters]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.direction) params.direction = filters.direction;
      
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
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: FaClock, label: 'En attente' },
      sent: { color: 'bg-green-100 text-green-800', icon: FaCheckCircle, label: 'Envoyé' },
      failed: { color: 'bg-red-100 text-red-800', icon: FaTimesCircle, label: 'Échoué' },
      received: { color: 'bg-blue-100 text-blue-800', icon: FaCheckCircle, label: 'Reçu' },
    };

    const Status = statusMap[status] || statusMap.pending;
    const Icon = Status.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${Status.color}`}>
        <Icon className="mr-1.5 w-3 h-3" />
        {Status.label}
      </span>
    );
  };

  const getDirectionBadge = (direction) => {
    const directionMap = {
      outgoing: { color: 'bg-purple-100 text-purple-800', label: '📤 Sortant' },
      incoming: { color: 'bg-indigo-100 text-indigo-800', label: '📥 Entrant' },
    };

    const Dir = directionMap[direction] || directionMap.outgoing;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${Dir.color}`}>
        {Dir.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const filteredMessages = messages.filter(msg => {
    const search = searchTerm.toLowerCase();
    return msg.phoneNumber?.toLowerCase().includes(search) ||
           msg.message?.toLowerCase().includes(search);
  });

  const paginatedMessages = filteredMessages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);

  const handleCopyPhone = (phone) => {
    navigator.clipboard.writeText(phone);
    setToast({ message: 'Numéro copié !', type: 'success' });
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
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <FaSms className="text-green-500 mr-3" />
            Historique des SMS
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {filteredMessages.length} message{filteredMessages.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <FaDownload className="w-4 h-4" />
          <span>Exporter</span>
        </button>
      </div>

      {/* Filtres */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par numéro ou message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filters.direction}
              onChange={(e) => setFilters(prev => ({ ...prev, direction: e.target.value }))}
              className="input-field w-auto min-w-[150px]"
            >
              <option value="">Tous les sens</option>
              <option value="outgoing">📤 Sortants</option>
              <option value="incoming">📥 Entrants</option>
            </select>
            <button
              onClick={() => setFilters({ direction: '', status: '' })}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Liste des messages */}
      <div className="space-y-3">
        {paginatedMessages.length === 0 ? (
          <div className="card text-center py-12">
            <FaSms className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg">Aucun SMS trouvé</p>
            <p className="text-sm text-gray-400">Ajustez vos filtres ou synchronisez votre boîte de réception</p>
          </div>
        ) : (
          paginatedMessages.map((msg) => (
            <div key={msg.id} className="card hover:shadow-lg transition-shadow duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Info principale */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    {getDirectionBadge(msg.direction)}
                    {getStatusBadge(msg.status)}
                    <span className="text-xs text-gray-400 flex items-center">
                      <FaCalendar className="mr-1 w-3 h-3" />
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold flex-shrink-0">
                      {msg.phoneNumber?.slice(-2) || '??'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <FaPhone className="w-3 h-3 text-gray-400" />
                        <span className="text-sm font-medium text-gray-800">{msg.phoneNumber}</span>
                        <button
                          onClick={() => handleCopyPhone(msg.phoneNumber)}
                          className="text-xs text-blue-500 hover:text-blue-700"
                        >
                          Copier
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 truncate mt-1">{msg.message}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setSelectedMessage(msg)}
                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <FaEye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Détails supplémentaires pour les messages envoyés */}
              {msg.direction === 'outgoing' && msg.sentAt && (
                <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-400">
                  <span>📤 Envoyé le {formatDate(msg.sentAt)}</span>
                  {msg.errorCode && <span className="text-red-400">Erreur: {msg.errorCode}</span>}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between card">
          <span className="text-sm text-gray-500">
            Page {currentPage} sur {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal de détails */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Détails du SMS</h3>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Numéro</label>
                <p className="text-gray-800 font-medium">{selectedMessage.phoneNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Message</label>
                <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{selectedMessage.message}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Statut</label>
                <div className="mt-1">{getStatusBadge(selectedMessage.status)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Direction</label>
                <div className="mt-1">{getDirectionBadge(selectedMessage.direction)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date</label>
                <p className="text-gray-800">{formatDate(selectedMessage.createdAt)}</p>
              </div>
              {selectedMessage.rawResponse && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Réponse brute</label>
                  <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg font-mono break-all">
                    {selectedMessage.rawResponse}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default SmsHistory;