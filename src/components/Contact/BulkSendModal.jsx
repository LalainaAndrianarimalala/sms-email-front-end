import React, { useState } from 'react';
import { FaEnvelope, FaSms, FaPaperPlane, FaTimes, FaUsers } from 'react-icons/fa';
import { contactService } from '../../api/api';
import Toast from '../Common/Toast';
import LoadingSpinner from '../Common/LoadingSpinner';

const MAX_SMS = 160;

const BulkSendModal = ({ mode = 'email', contacts = [], onClose, onSuccess }) => {
  const isEmail = mode === 'email';

  // Filtrer les contacts valides selon le mode
  const eligible = contacts.filter((c) =>
    isEmail ? Boolean(c.adresseEmail) : Boolean(c.numeroTelephone)
  );
  const skipped = contacts.length - eligible.length;

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const contactIds = eligible.map((c) => c.id);

      const res = isEmail
        ? await contactService.sendBulkEmail({ contactIds, subject, message })
        : await contactService.sendBulkSms({ contactIds, message });

      setToast({ message: res.data.message, type: 'success' });

      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Erreur lors de l'envoi",
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            {isEmail ? (
              <FaEnvelope className="text-blue-500 mr-2" />
            ) : (
              <FaSms className="text-green-500 mr-2" />
            )}
            Envoi groupé {isEmail ? 'Email' : 'SMS'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <FaTimes />
          </button>
        </div>

        {/* Info destinataires */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 shrink-0">
          <div className="flex items-center space-x-2 mb-2">
            <FaUsers className="text-blue-500" />
            <span className="font-semibold text-gray-800">
              {eligible.length} destinataire(s)
            </span>
          </div>

          {skipped > 0 && (
            <p className="text-xs text-orange-600 bg-orange-50 rounded p-2 mt-2">
              ⚠️ {skipped} contact(s) ignoré(s) — {isEmail ? 'sans adresse email' : 'sans numéro de téléphone'}
            </p>
          )}

          <div className="mt-2 max-h-24 overflow-y-auto text-xs text-gray-600 space-y-0.5">
            {eligible.map((c) => (
              <div key={c.id} className="truncate">
                • {c.NomComplet}{' '}
                <span className="text-gray-400">
                  {isEmail ? `(${c.adresseEmail})` : `(${c.numeroTelephone})`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto">
          {isEmail && (
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
          )}

          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Message <span className="text-red-500">*</span>
              </label>
              {!isEmail && (
                <span className={`text-xs ${message.length > MAX_SMS ? 'text-red-500' : 'text-gray-500'}`}>
                  {message.length}/{MAX_SMS}
                </span>
              )}
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={isEmail ? 6 : 4}
              maxLength={isEmail ? undefined : MAX_SMS}
              className="input-field"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || eligible.length === 0}
            className={`${isEmail ? 'btn-primary' : 'btn-success'} w-full flex items-center justify-center py-3 disabled:opacity-50`}
          >
            {loading ? (
              <><LoadingSpinner size="sm" /><span className="ml-2">Envoi en cours...</span></>
            ) : (
              <><FaPaperPlane className="mr-2" /> Envoyer à {eligible.length} contact(s)</>
            )}
          </button>
        </form>

        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
};

export default BulkSendModal;