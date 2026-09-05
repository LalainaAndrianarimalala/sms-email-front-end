import React, { useState } from 'react';
import { FaPaperPlane, FaTimes } from 'react-icons/fa';
import { emailService } from '../../api/api';
import Toast from '../Common/Toast';
import LoadingSpinner from '../Common/LoadingSpinner';

const EmailForm = () => {
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    message: '',
    name: '',
    html: '',
  });
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachments(prev => [...prev, {
          filename: file.name,
          content: event.target.result,
          encoding: 'base64'
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        to: formData.to.split(',').map(email => email.trim()).filter(email => email),
        attachments: attachments,
      };

      const response = await emailService.send(payload);
      setToast({ message: response.data.message || 'Email envoyé avec succès!', type: 'success' });
      
      // Reset form
      setFormData({ to: '', subject: '', message: '', name: '', html: '' });
      setAttachments([]);
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de l\'envoi de l\'email';
      setToast({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <FaPaperPlane className="text-blue-500 mr-3" />
        Envoyer un Email
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Destinataires <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="to"
            value={formData.to}
            onChange={handleChange}
            placeholder="exemple@email.com, autre@email.com"
            className="input-field"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Séparer les adresses par des virgules</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sujet <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Sujet de l'email"
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom de l'expéditeur
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Votre nom"
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="6"
            placeholder="Votre message..."
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            HTML (optionnel)
          </label>
          <textarea
            name="html"
            value={formData.html}
            onChange={handleChange}
            rows="4"
            placeholder="Contenu HTML personnalisé..."
            className="input-field font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">Laissez vide pour utiliser le formatage automatique</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pièces jointes
          </label>
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          
          {attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {attachments.map((att, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                  <span className="text-sm text-gray-700">{att.filename}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center py-3"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Envoi en cours...</span>
            </>
          ) : (
            <>
              <FaPaperPlane className="mr-2" />
              Envoyer l'email
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

export default EmailForm;