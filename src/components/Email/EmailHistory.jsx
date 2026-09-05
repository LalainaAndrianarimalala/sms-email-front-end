import React, { useState, useEffect } from 'react';
import { 
  FaEnvelope, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaSearch,
  FaDownload,
  FaEye,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
  FaUser,
  FaCalendar,
  FaReply
} from 'react-icons/fa';
import { emailService } from '../../api/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import Toast from '../Common/Toast';

const EmailHistory = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const response = await emailService.list();
      setEmails(response.data.data || []);
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

  const filteredEmails = emails.filter(email => {
    const search = searchTerm.toLowerCase();
    return email.subject?.toLowerCase().includes(search) ||
           email.recipient?.toLowerCase().includes(search) ||
           email.bodyText?.toLowerCase().includes(search);
  });

  const paginatedEmails = filteredEmails.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredEmails.length / itemsPerPage);

  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email);
    setToast({ message: 'Email copié !', type: 'success' });
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
        <button onClick={fetchEmails} className="btn-primary mt-4">Réessayer</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <FaEnvelope className="text-blue-500 mr-3" />
            Historique des Emails
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {filteredEmails.length} email{filteredEmails.length > 1 ? 's' : ''} au total
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
              placeholder="Rechercher par sujet, destinataire ou contenu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>
      </div>

      {/* Liste des emails */}
      <div className="space-y-3">
        {paginatedEmails.length === 0 ? (
          <div className="card text-center py-12">
            <FaEnvelope className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg">Aucun email trouvé</p>
            <p className="text-sm text-gray-400">Ajustez vos filtres ou envoyez un nouvel email</p>
          </div>
        ) : (
          paginatedEmails.map((email) => (
            <div key={email.id} className="card hover:shadow-lg transition-shadow duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Info principale */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    {getStatusBadge(email.status)}
                    <span className="text-xs text-gray-400 flex items-center">
                      <FaCalendar className="mr-1 w-3 h-3" />
                      {formatDate(email.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold flex-shrink-0">
                      {email.sender?.charAt(0).toUpperCase() || 'E'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <FaUser className="w-3 h-3 text-gray-400" />
                        <span className="text-sm font-medium text-gray-800">{email.sender}</span>
                        <span className="text-xs text-gray-400">→</span>
                        <span 
                          className="text-sm text-gray-600 cursor-pointer hover:text-blue-500"
                          onClick={() => handleCopyEmail(email.recipient)}
                        >
                          {email.recipient}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-800 truncate mt-1">{email.subject}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setSelectedEmail(email)}
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
      {selectedEmail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Détails de l'email</h3>
              <button
                onClick={() => setSelectedEmail(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Sujet</label>
                <p className="text-gray-800 font-medium">{selectedEmail.subject}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">De</label>
                <p className="text-gray-800">{selectedEmail.sender}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">À</label>
                <p className="text-gray-800">{selectedEmail.recipient}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Statut</label>
                <div className="mt-1">{getStatusBadge(selectedEmail.status)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date</label>
                <p className="text-gray-800">{formatDate(selectedEmail.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Message</label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800 whitespace-pre-wrap">{selectedEmail.bodyText}</p>
                  {selectedEmail.bodyHtml && (
                    <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg">
                      <p className="text-xs text-gray-500 mb-2">Aperçu HTML :</p>
                      <div dangerouslySetInnerHTML={{ __html: selectedEmail.bodyHtml }} />
                    </div>
                  )}
                </div>
              </div>
              {selectedEmail.errorMessage && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Erreur</label>
                  <p className="text-red-600 bg-red-50 p-3 rounded-lg">{selectedEmail.errorMessage}</p>
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

export default EmailHistory;