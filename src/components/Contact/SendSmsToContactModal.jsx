import React, { useState } from 'react';
import { FaSms, FaPaperPlane, FaTimes } from 'react-icons/fa';
import { contactService } from '../../api/api';
import Toast from '../Common/Toast';
import LoadingSpinner from '../Common/LoadingSpinner';

const MAX_CHARS = 160;

const SendSmsToContactModal = ({ contact, onClose, onSuccess }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await contactService.sendSms(contact.id, { message });
      setToast({ message: res.data.message, type: res.data.success ? 'success' : 'error' });
      if (res.data.success) {
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1500);
      }
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Erreur lors de l'envoi",
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            <FaSms className="text-green-500 mr-2" />
            Envoyer un SMS
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <FaTimes />
          </button>
        </div>

        <div className="bg-green-50 p-3 rounded-lg mb-4">
          <p className="text-sm text-gray-600">Destinataire :</p>
          <p className="font-semibold text-gray-800">{contact.NomComplet}</p>
          <p className="text-sm text-green-600">{contact.numeroTelephone}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Message <span className="text-red-500">*</span>
              </label>
              <span className={`text-xs ${message.length > MAX_CHARS ? 'text-red-500' : 'text-gray-500'}`}>
                {message.length}/{MAX_CHARS}
              </span>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={MAX_CHARS}
              className="input-field"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-success w-full flex items-center justify-center py-3"
          >
            {loading ? (
              <><LoadingSpinner size="sm" /><span className="ml-2">Envoi...</span></>
            ) : (
              <><FaPaperPlane className="mr-2" /> Envoyer</>
            )}
          </button>
        </form>

        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
};

export default SendSmsToContactModal;