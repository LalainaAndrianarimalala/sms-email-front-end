import React, { useState, useEffect } from 'react';
import { 
  FaSms, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaFilter, 
  FaSearch,
  FaDownload,
  FaEye,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
  FaPhone,
  FaUser,
  FaCalendar,
  FaTimes,
  FaFileExcel,
  FaCalendarAlt,
  FaSort,
  FaSortUp,
  FaSortDown
} from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { smsService } from '../../api/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import Toast from '../Common/Toast';

const SmsHistory = () => {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    direction: '',
    status: '',
    phone: '',
    startDate: '',
    endDate: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [toast, setToast] = useState(null);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [messages, searchTerm, filters, sortField, sortDirection]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await smsService.history();
      setMessages(response.data.messages || []);
    } catch (error) {
      setError('Erreur lors du chargement de l\'historique');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...messages];

    // Recherche
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(msg => 
        msg.phoneNumber?.toLowerCase().includes(search) ||
        msg.message?.toLowerCase().includes(search)
      );
    }

    // Filtre direction
    if (filters.direction) {
      filtered = filtered.filter(msg => msg.direction === filters.direction);
    }

    // Filtre statut
    if (filters.status) {
      filtered = filtered.filter(msg => msg.status === filters.status);
    }

    // Filtre numéro
    if (filters.phone) {
      filtered = filtered.filter(msg => 
        msg.phoneNumber?.includes(filters.phone)
      );
    }

    // Filtre date début
    if (filters.startDate) {
      const start = new Date(filters.startDate);
      filtered = filtered.filter(msg => 
        msg.createdAt && new Date(msg.createdAt) >= start
      );
    }

    // Filtre date fin
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59);
      filtered = filtered.filter(msg => 
        msg.createdAt && new Date(msg.createdAt) <= end
      );
    }

    // Tri
    filtered.sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      
      if (sortField === 'createdAt' || sortField === 'sentAt') {
        aVal = new Date(aVal).getTime() || 0;
        bVal = new Date(bVal).getTime() || 0;
      }
      
      if (sortField === 'phoneNumber') {
        aVal = aVal.toString().toLowerCase();
        bVal = bVal.toString().toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredMessages(filtered);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      direction: '',
      status: '',
      phone: '',
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
      // Préparer les données pour l'export
      const exportData = filteredMessages.map(msg => ({
        'ID': msg.id,
        'Direction': msg.direction === 'outgoing' ? 'Sortant' : 'Entrant',
        'Numéro': msg.phoneNumber,
        'Message': msg.message,
        'Statut': msg.status,
        'Envoyé le': msg.sentAt ? new Date(msg.sentAt).toLocaleString('fr-FR') : 'N/A',
        'Créé le': msg.createdAt ? new Date(msg.createdAt).toLocaleString('fr-FR') : 'N/A',
        'Code erreur': msg.errorCode || 'N/A',
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Ajuster la largeur des colonnes
      const colWidths = [
        { wch: 8 },  // ID
        { wch: 10 }, // Direction
        { wch: 18 }, // Numéro
        { wch: 40 }, // Message
        { wch: 12 }, // Statut
        { wch: 20 }, // Envoyé le
        { wch: 20 }, // Créé le
        { wch: 15 }, // Code erreur
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'SMS');
      
      const fileName = `historique_sms_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      setToast({ 
        message: `Export Excel effectué avec succès (${filteredMessages.length} SMS)`, 
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
      received: { color: 'bg-blue-100 text-blue-800', icon: FaCheckCircle, label: 'Reçu' },
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

  const getDirectionBadge = (direction) => {
    const directionMap = {
      outgoing: { color: 'bg-purple-100 text-purple-800', label: '📤 Sortant' },
      incoming: { color: 'bg-indigo-100 text-indigo-800', label: '📥 Entrant' },
    };

    const Dir = directionMap[direction] || directionMap.outgoing;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${Dir.color}`}>
        {Dir.label}
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

  const paginatedMessages = filteredMessages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);

  const handleCopyPhone = (phone) => {
    navigator.clipboard.writeText(phone);
    setToast({ message: 'Numéro copié !', type: 'success' });
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
        <button onClick={fetchHistory} className="btn-primary mt-4">Réessayer</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <FaSms className="text-green-500 mr-3" />
            Historique des SMS
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {filteredMessages.length} message{filteredMessages.length > 1 ? 's' : ''} sur {messages.length} au total
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-primary flex items-center space-x-2"
          >
            <FaFilter className="w-4 h-4" />
            <span>Filtres</span>
            {(filters.direction || filters.status || filters.phone || filters.startDate || filters.endDate) && (
              <span className="ml-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {Object.values(filters).filter(v => v).length}
              </span>
            )}
          </button>
          <button
            onClick={exportToExcel}
            className="btn-success flex items-center space-x-2"
            disabled={filteredMessages.length === 0}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
              <select
                value={filters.direction}
                onChange={(e) => setFilters(prev => ({ ...prev, direction: e.target.value }))}
                className="input-field"
              >
                <option value="">Tous</option>
                <option value="outgoing">📤 Sortants</option>
                <option value="incoming">📥 Entrants</option>
              </select>
            </div>
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
                <option value="received">📥 Reçu</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Numéro</label>
              <input
                type="text"
                value={filters.phone}
                onChange={(e) => setFilters(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+261..."
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
            placeholder="Rechercher par numéro ou message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Liste des messages */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('direction')}>
                <div className="flex items-center space-x-1">
                  <span>Direction</span>
                  {getSortIcon('direction')}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('phoneNumber')}>
                <div className="flex items-center space-x-1">
                  <span>Numéro</span>
                  {getSortIcon('phoneNumber')}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
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
            {paginatedMessages.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                  <FaSms className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Aucun SMS trouvé</p>
                  <p className="text-sm text-gray-400">Ajustez vos filtres ou synchronisez votre boîte de réception</p>
                </td>
              </tr>
            ) : (
              paginatedMessages.map((msg) => (
                <tr key={msg.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    {getDirectionBadge(msg.direction)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">{msg.phoneNumber}</span>
                      <button
                        onClick={() => handleCopyPhone(msg.phoneNumber)}
                        className="text-xs text-blue-500 hover:text-blue-700"
                      >
                        Copier
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-600 max-w-xs truncate">{msg.message}</p>
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(msg.status)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(msg.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedMessage(msg)}
                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Voir les détails"
                      >
                        <FaEye className="w-4 h-4" />
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
            Page {currentPage} sur {totalPages} ({filteredMessages.length} éléments)
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
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Détails du SMS</h3>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Numéro</label>
                <p className="text-gray-800 font-medium">{selectedMessage.phoneNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Message</label>
                <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{selectedMessage.message}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Statut</label>
                <div className="mt-1">{getStatusBadge(selectedMessage.status)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Direction</label>
                <div className="mt-1">{getDirectionBadge(selectedMessage.direction)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date de création</label>
                <p className="text-gray-800">{formatDate(selectedMessage.createdAt)}</p>
              </div>
              {selectedMessage.sentAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Date d'envoi</label>
                  <p className="text-gray-800">{formatDate(selectedMessage.sentAt)}</p>
                </div>
              )}
              {selectedMessage.rawResponse && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Réponse brute</label>
                  <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg font-mono break-all">
                    {selectedMessage.rawResponse}
                  </p>
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

export default SmsHistory;