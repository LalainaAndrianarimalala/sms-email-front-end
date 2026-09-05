import React, { useState } from 'react';
import { FaSms, FaCheckCircle, FaPlus, FaTimes } from 'react-icons/fa';
import { smsService } from '../../api/api';
import Toast from '../Common/Toast';
import LoadingSpinner from '../Common/LoadingSpinner';

const SmsForm = () => {
  const [formData, setFormData] = useState({
    numbers: [''],
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [charCount, setCharCount] = useState(0);
  const MAX_CHARS = 160;

  const handleNumberChange = (index, value) => {
    const newNumbers = [...formData.numbers];
    newNumbers[index] = value;
    setFormData(prev => ({ ...prev, numbers: newNumbers }));
  };

  const addNumber = () => {
    setFormData(prev => ({
      ...prev,
      numbers: [...prev.numbers, '']
    }));
  };

  const removeNumber = (index) => {
    if (formData.numbers.length > 1) {
      const newNumbers = formData.numbers.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, numbers: newNumbers }));
    }
  };

  const handleMessageChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, message: value }));
    setCharCount(value.length);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Filtrer les numéros vides
    const validNumbers = formData.numbers.filter(num => num.trim() !== '');
    
    if (validNumbers.length === 0) {
      setToast({ 
        message: 'Veuillez saisir au moins un numéro de téléphone', 
        type: 'error' 
      });
      return;
    }

    setLoading(true);

    try {
      // Envoyer un SMS par numéro ou un seul SMS avec tous les numéros
      // Selon l'API, on peut envoyer à plusieurs destinataires en une seule requête
      const response = await smsService.send({
        numbers: validNumbers, // Envoyer un tableau de numéros
        message: formData.message,
      });
      
      setToast({ 
        message: response.data.success 
          ? `SMS envoyé avec succès à ${validNumbers.length} destinataire(s)!` 
          : 'Erreur lors de l\'envoi', 
        type: response.data.success ? 'success' : 'error' 
      });
      
      if (response.data.success) {
        setFormData({ numbers: [''], message: '' });
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
            Numéros de téléphone <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {formData.numbers.map((number, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="tel"
                  value={number}
                  onChange={(e) => handleNumberChange(index, e.target.value)}
                  placeholder="+261XXXXXXXXX"
                  className="input-field flex-1"
                  required={index === 0}
                />
                {formData.numbers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeNumber(index)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addNumber}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            <FaPlus className="mr-1" />
            Ajouter un numéro
          </button>
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
            onChange={handleMessageChange}
            rows="4"
            placeholder="Votre message SMS..."
            className={`input-field ${charCount > MAX_CHARS ? 'border-red-500' : ''}`}
            maxLength={MAX_CHARS}
            required
          />
        </div>

        <div className="text-sm text-gray-500">
          <p>Destinataires: {formData.numbers.filter(n => n.trim() !== '').length}</p>
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