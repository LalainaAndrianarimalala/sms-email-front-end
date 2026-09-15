import React, { useState, useEffect } from 'react';
import { FaUserPlus, FaUserEdit, FaTimes, FaSave } from 'react-icons/fa';
import { contactService } from '../../api/api';
import Toast from '../Common/Toast';
import LoadingSpinner from '../Common/LoadingSpinner';

const ContactFormModal = ({ contact = null, onClose, onSuccess }) => {
  const isEdit = Boolean(contact);
  const [form, setForm] = useState({
    NomComplet: '',
    adresseEmail: '',
    numeroTelephone: '',
    status: true,
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (isEdit && contact) {
      setForm({
        NomComplet: contact.NomComplet || '',
        adresseEmail: contact.adresseEmail || '',
        numeroTelephone: contact.numeroTelephone || '',
        status: contact.status ?? true,
      });
    }
  }, [contact, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Normalise le téléphone vers +261XXXXXXXXX avant envoi
  const normalizePhone = (num) => {
    if (!num) return num;
    let c = String(num).replace(/[^0-9+]/g, '');
    if (c.startsWith('0')) c = '+261' + c.substring(1);
    if (c.startsWith('261') && !c.startsWith('+')) c = '+' + c;
    return c;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        numeroTelephone: normalizePhone(form.numeroTelephone),
      };

      let res;
      if (isEdit) {
        res = await contactService.update(contact.id, payload);
      } else {
        res = await contactService.create(payload);
      }

      setToast({
        message: res.data.message || (isEdit ? 'Contact mis à jour' : 'Contact créé'),
        type: 'success',
      });

      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1200);
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Erreur lors de l'enregistrement",
        type: 'error',
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
            {isEdit ? (
              <><FaUserEdit className="text-purple-500 mr-2" /> Modifier le contact</>
            ) : (
              <><FaUserPlus className="text-blue-500 mr-2" /> Nouveau contact</>
            )}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom complet <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="NomComplet"
              value={form.NomComplet}
              onChange={handleChange}
              placeholder="Ex: Jean Dupont"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse email
            </label>
            <input
              type="email"
              name="adresseEmail"
              value={form.adresseEmail}
              onChange={handleChange}
              placeholder="exemple@email.com"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numéro de téléphone
            </label>
            <input
              type="tel"
              name="numeroTelephone"
              value={form.numeroTelephone}
              onChange={handleChange}
              placeholder="0341234567 ou +261341234567"
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              Format accepté : <code>0341234567</code> ou <code>+261341234567</code>
            </p>
          </div>

          {isEdit && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="status"
                name="status"
                checked={form.status}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="status" className="text-sm text-gray-700">
                Contact actif
              </label>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary flex items-center justify-center"
            >
              {loading ? (
                <><LoadingSpinner size="sm" /><span className="ml-2">Enregistrement...</span></>
              ) : (
                <><FaSave className="mr-2" /> {isEdit ? 'Mettre à jour' : 'Créer'}</>
              )}
            </button>
          </div>
        </form>

        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
};

export default ContactFormModal;