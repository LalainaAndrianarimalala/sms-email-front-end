import React, { useState, useEffect } from 'react';
import { FaInbox, FaSync, FaDownload } from 'react-icons/fa';
import { smsService } from '../../api/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import Toast from '../Common/Toast';

const SmsInbox = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

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
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <FaInbox className="text-indigo-500 mr-3" />
          Boîte de réception SMS
        </h2>
        <div className="flex items-center space-x-3">
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
                <FaSync className={syncing ? 'animate-spin' : ''} />
                <span>Synchroniser</span>
              </>
            )}
          </button>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FaInbox className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Aucun SMS dans la boîte de réception</p>
          <p className="text-sm mt-2">Cliquez sur "Synchroniser" pour importer les nouveaux messages</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-medium text-gray-800">{msg.phoneNumber}</span>
                    <span className="text-xs text-gray-500">
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ''}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Reçu
                    </span>
                  </div>
                  <p className="text-gray-700">{msg.message}</p>
                </div>
              </div>
            </div>
          ))}
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