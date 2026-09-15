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
  FaReply,
  FaFilter,
  FaTimes,
  FaFileExcel,
  FaSort,
  FaSortUp,
  FaSortDown
} from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { emailService } from '../../api/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import Toast from '../Common/Toast';

const EmailHistory = () => {
  const [emails, setEmails] = useState([]);
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    sender: '',
    startDate: '',
    endDate: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [toast, setToast] = useState(null);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    fetchEmails();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [emails, searchTerm, filters, sortField, sortDirection]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const response = await emailService.list({ limit: 1000, offset: 0 });
      setEmails(response.data.data || []);
    } catch (error) {
      setError('Erreur lors du chargement de l\'historique');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...emails];

    // Recherche
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(email => 
        email.subject?.toLowerCase().includes(search) ||
        email.recipient?.toLowerCase().includes(search) ||
        email.sender?.toLowerCase().includes(search) ||
        email.bodyText?.toLowerCase().includes(search)
      );
    }

    // Filtre statut
    if (filters.status) {
      filtered = filtered.filter(email => email.status === filters.status);
    }

    // Filtre expéditeur
    if (filters.sender) {
      filtered = filtered.filter(email => 
        email.sender?.toLowerCase().includes(filters.sender.toLowerCase())
      );
    }

    // Filtre date début
    if (filters.startDate) {
      const start = new Date(filters.startDate);
      filtered = filtered.filter(email => 
        email.createdAt && new Date(email.createdAt) >= start
      );
    }

    // Filtre date fin
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59);
      filtered = filtered.filter(email => 
        email.createdAt && new Date(email.createdAt) <= end
      );
    }

    // Tri
    filtered.sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      
      if (sortField === 'createdAt') {
        aVal = new Date(aVal).getTime() || 0;
        bVal = new Date(bVal).getTime() || 0;
      }
      
      if (sortField === 'subject' || sortField === 'recipient' || sortField === 'sender') {
        aVal = aVal.toString().toLowerCase();
        bVal = bVal.toString().toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredEmails(filtered);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      status: '',
      sender: '',
      startDate: '',
      endDate: '',
    });
    setSearchTerm('');
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="w-3 h-3" />;
    return sortDirection === 'asc' ? 
      <FaSortUp className="w-3 h-3" /> : 
      <FaSortDown className="w-3 h-3" />;
  };

  const exportToExcel = () => {
    try {
      const exportData = filteredEmails.map(email => ({
        'ID': email.id,
        'Sujet': email.subject,
        'Expéditeur': email.sender,
        'Destinataire': email.recipient,
        'Statut': email.status === 'sent' ? 'Envoyé' : email.status === 'failed' ? 'Échoué' : 'En attente',
        'Message': email.bodyText,
        'Créé le': email.createdAt ? new Date(email.createdAt).toLocaleString('fr-FR') : 'N/A',
        'Erreur': email.errorMessage || 'N/A',
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      const colWidths = [
        { wch: 8 },   // ID
        { wch: 30 },  // Sujet
        { wch: 20 },  // Expéditeur
        { wch: 25 },  // Destinataire
        { wch: 12 },  // Statut
        { wch: 50 },  // Message
        { wch: 20 },  // Créé le
        { wch: 30 },  // Erreur
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Emails');
      
      const fileName = `historique_emails_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      setToast({ 
        message: `Export Excel effectué avec succès (${filteredEmails.length} emails)`, 
        type: 'success' 
      });
    } catch (err) {
      setToast({ 
        message: 'Erreur lors de l\'export Excel', 
        type: 'error' 
      });
      console.error(err);
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
            {filteredEmails.length} email{filteredEmails.length > 1 ? 's' : ''} sur {emails.length} au total
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-primary flex items-center space-x-2"
          >
            <FaFilter className="w-4 h-4" />
            <span>Filtres</span>
            {(filters.status || filters.sender || filters.startDate || filters.endDate) && (
              <span className="ml-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {Object.values(filters).filter(v => v).length}
              </span>
            )}
          </button>
          <button
            onClick={exportToExcel}
            className="btn-success flex items-center space-x-2"
            disabled={filteredEmails.length === 0}
          >
            <FaFileExcel className="w-4 h-4" />
            <span>Exporter Excel</span>
          </button>
        </div>
      </div>

      {/* Filtres */}
      {showFilters && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaFilter className="mr-2 text-blue-500" />
              Filtres avancés
            </h3>
            <button
              onClick={resetFilters}
              className="text-sm text-red-500 hover:text-red-700 flex items-center"
            >
              <FaTimes className="mr-1" />
              Réinitialiser
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="input-field"
              >
                <option value="">Tous</option>
                <option value="sent">✅ Envoyé</option>
                <option value="failed">❌ Échoué</option>
                <option value="pending">⏳ En attente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expéditeur</label>
              <input
                type="text"
                value={filters.sender}
                onChange={(e) => setFilters(prev => ({ ...prev, sender: e.target.value }))}
                placeholder="email@exemple.com"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="input-field"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="btn-primary w-full"
              >
                Appliquer les filtres
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recherche */}
      <div className="card">
        <div className="relative">
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

      {/* Liste des emails */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('subject')}>
                <div className="flex items-center space-x-1">
                  <span>Sujet</span>
                  {getSortIcon('subject')}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('sender')}>
                <div className="flex items-center space-x-1">
                  <span>Expéditeur</span>
                  {getSortIcon('sender')}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('recipient')}>
                <div className="flex items-center space-x-1">
                  <span>Destinataire</span>
                  {getSortIcon('recipient')}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('status')}>
                <div className="flex items-center space-x-1">
                  <span>Statut</span>
                  {getSortIcon('status')}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('createdAt')}>
                <div className="flex items-center space-x-1">
                  <span>Date</span>
                  {getSortIcon('createdAt')}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedEmails.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                  <FaEnvelope className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Aucun email trouvé</p>
                  <p className="text-sm text-gray-400">Ajustez vos filtres ou envoyez un nouvel email</p>
                </td>
              </tr>
            ) : (
              paginatedEmails.map((email) => (
                <tr key={email.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-700 max-w-xs truncate">{email.subject}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-600 max-w-xs truncate">{email.sender}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 max-w-xs truncate">{email.recipient}</span>
                      <button
                        onClick={() => handleCopyEmail(email.recipient)}
                        className="text-xs text-blue-500 hover:text-blue-700 flex-shrink-0"
                      >
                        Copier
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(email.status)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(email.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedEmail(email)}
                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Voir les détails"
                      >
                        <FaEye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                        title="Répondre"
                      >
                        <FaReply className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between card">
          <span className="text-sm text-gray-500">
            Page {currentPage} sur {totalPages} ({filteredEmails.length} éléments)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg">
              {currentPage}
            </span>
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