import React, { useState } from 'react';
import { FaEnvelope, FaPaperPlane, FaTimes } from 'react-icons/fa';
import { contactService } from '../../api/api';
import Toast from '../Common/Toast';
import LoadingSpinner from '../Common/LoadingSpinner';

const SendEmailToContactModal = ({ contact, onClose, onSuccess }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await contactService.sendEmail(contact.id, { subject, message });
      setToast({ message: res.data.message, type: 'success' });
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
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
            <FaEnvelope className="text-blue-500 mr-2" />
            Envoyer un email
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <FaTimes />
          </button>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg mb-4">
          <p className="text-sm text-gray-600">Destinataire :</p>
          <p className="font-semibold text-gray-800">{contact.NomComplet}</p>
          <p className="text-sm text-blue-600">{contact.adresseEmail}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sujet <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="input-field"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center py-3"
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

export default SendEmailToContactModal;