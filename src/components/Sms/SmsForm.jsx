import React, { useState } from 'react';
import { FaSms, FaCheckCircle } from 'react-icons/fa';
import { smsService } from '../../api/api';
import Toast from '../Common/Toast';
import LoadingSpinner from '../Common/LoadingSpinner';

const SmsForm = () => {
  const [formData, setFormData] = useState({
    number: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [charCount, setCharCount] = useState(0);
  const MAX_CHARS = 160;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'message') {
      setCharCount(value.length);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await smsService.send(formData);
      setToast({ 
        message: response.data.success ? 'SMS envoyé avec succès!' : 'Erreur lors de l\'envoi', 
        type: response.data.success ? 'success' : 'error' 
      });
      
      if (response.data.success) {
        setFormData({ number: '', message: '' });
        setCharCount(0);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de l\'envoi du SMS';
      setToast({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <FaSms className="text-green-500 mr-3" />
        Envoyer un SMS
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Numéro de téléphone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="number"
            value={formData.number}
            onChange={handleChange}
            placeholder="+261XXXXXXXXX"
            className="input-field"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Format: +261 suivi de 9 chiffres</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Message <span className="text-red-500">*</span>
            </label>
            <span className={`text-xs ${charCount > MAX_CHARS ? 'text-red-500' : 'text-gray-500'}`}>
              {charCount}/{MAX_CHARS} caractères
            </span>
          </div>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="4"
            placeholder="Votre message SMS..."
            className={`input-field ${charCount > MAX_CHARS ? 'border-red-500' : ''}`}
            maxLength={MAX_CHARS}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-success w-full flex items-center justify-center py-3"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Envoi en cours...</span>
            </>
          ) : (
            <>
              <FaCheckCircle className="mr-2" />
              Envoyer le SMS
            </>
          )}
        </button>
      </form>

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

export default SmsForm;