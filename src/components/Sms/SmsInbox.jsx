import React, { useState, useEffect } from 'react';
import { 
  FaInbox, 
  FaSync, 
  FaSearch,
  FaUser,
  FaCalendar,
  FaPhone,
  FaReply,
  FaTrash,
  FaEye
} from 'react-icons/fa';
import { smsService } from '../../api/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import Toast from '../Common/Toast';

const SmsInbox = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    fetchInbox();
  }, []);

  const fetchInbox = async () => {
    try {
      setLoading(true);
      const response = await smsService.inbox();
      setMessages(response.data.messages || []);
    } catch (error) {
      setError('Erreur lors du chargement de la boîte de réception');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const response = await smsService.sync();
      setToast({
        message: `${response.data.count} nouveau(x) SMS synchronisé(s)`,
        type: response.data.count > 0 ? 'success' : 'info'
      });
      await fetchInbox();
    } catch (error) {
      setToast({
        message: error.response?.data?.message || 'Erreur lors de la synchronisation',
        type: 'error'
      });
    } finally {
      setSyncing(false);
    }
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
        <button onClick={fetchInbox} className="btn-primary mt-4">Réessayer</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <FaInbox className="text-indigo-500 mr-3" />
            Boîte de réception SMS
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {filteredMessages.length} message{filteredMessages.length > 1 ? 's' : ''} reçu{filteredMessages.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="btn-primary flex items-center space-x-2"
        >
          {syncing ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Synchronisation...</span>
            </>
          ) : (
            <>
              <FaSync className="w-4 h-4" />
              <span>Synchroniser</span>
            </>
          )}
        </button>
      </div>

      {/* Recherche */}
      <div className="card">
        <div className="relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par numéro ou message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Liste des messages */}
      <div className="space-y-3">
        {filteredMessages.length === 0 ? (
          <div className="card text-center py-12">
            <FaInbox className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg">Aucun SMS dans la boîte de réception</p>
            <p className="text-sm text-gray-400 mt-2">
              Cliquez sur "Synchroniser" pour importer les nouveaux messages
            </p>
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div key={msg.id} className="card hover:shadow-lg transition-shadow duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      📥 Reçu
                    </span>
                    <span className="text-xs text-gray-400 flex items-center">
                      <FaCalendar className="mr-1 w-3 h-3" />
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold flex-shrink-0">
                      {msg.phoneNumber?.slice(-2) || '??'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <FaPhone className="w-3 h-3 text-gray-400" />
                        <span className="text-sm font-medium text-gray-800">{msg.phoneNumber}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{msg.message}</p>
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
                  <button className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors">
                    <FaReply className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de détails */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Détails du SMS reçu</h3>
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
                <label className="text-sm font-medium text-gray-500">Date de réception</label>
                <p className="text-gray-800">{formatDate(selectedMessage.createdAt)}</p>
              </div>
              {selectedMessage.rawResponse && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Données brutes</label>
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

export default SmsInbox;