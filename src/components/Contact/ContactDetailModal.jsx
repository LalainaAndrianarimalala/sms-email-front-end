import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaEnvelope,
  FaSms,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaEdit,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaInbox,
} from "react-icons/fa";

import { contactService } from "../../api/api";
import LoadingSpinner from "../Common/LoadingSpinner";
import ContactStatsCards from "./ContactStatsCards";

const ContactDetailModal = ({
  contact,
  onClose,
  onSendEmail,
  onSendSms,
  onEdit,
}) => {
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0,
    totalPages: 1,
    currentPage: 1,
  });

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("");

  // Reset page quand les filtres changent
  useEffect(() => {
    setPagination((p) => ({ ...p, currentPage: 1 }));
  }, [itemsPerPage, filterType, filterStatus]);

  // Fetch stats
  useEffect(() => {
    if (!contact?.id) return;
    fetchStats();
  }, [contact?.id]);

  // Fetch history
  useEffect(() => {
    if (!contact?.id) return;
    fetchHistory();
  }, [contact?.id, pagination.currentPage, itemsPerPage, filterType, filterStatus]);

  // Fermer avec ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Bloquer le scroll du body quand la modale est ouverte
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await contactService.getStats(contact.id);
      setStats(res.data.data);
    } catch (err) {
      console.error("Erreur stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const offset = (pagination.currentPage - 1) * itemsPerPage;

      const res = await contactService.getHistory(contact.id, {
        limit: itemsPerPage,
        offset,
        type: filterType !== "all" ? filterType : undefined,
        status: filterStatus || undefined,
      });

      const items = res.data.data || [];
      const pg = res.data.pagination || {};

      setHistory(items);
      setPagination((prev) => ({
        total: pg.total ?? items.length,
        limit: pg.limit ?? itemsPerPage,
        offset: pg.offset ?? offset,
        totalPages:
          pg.totalPages ?? Math.ceil((pg.total ?? items.length) / itemsPerPage),
        currentPage: pg.currentPage ?? prev.currentPage,
      }));
    } catch (err) {
      console.error("Erreur historique:", err);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const goToPage = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    setPagination((p) => ({ ...p, currentPage: page }));
  };

  const formatDate = (d) =>
    d
      ? new Intl.DateTimeFormat("fr-FR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(d))
      : "N/A";

  const statusIcon = (s) => {
    if (s === "sent") return <FaCheckCircle className="text-green-500" />;
    if (s === "failed") return <FaTimesCircle className="text-red-500" />;
    return <FaClock className="text-yellow-500" />;
  };

  const statusLabel = (s) => {
    if (s === "sent") return "Envoyé";
    if (s === "failed") return "Échoué";
    return "En attente";
  };

  const getPageNumbers = () => {
    const total = pagination.totalPages;
    const current = pagination.currentPage;
    const delta = 1;

    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages = [1];
    const left = Math.max(2, current - delta);
    const right = Math.min(total - 1, current + delta);

    if (left > 2) pages.push("...");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < total - 1) pages.push("...");
    pages.push(total);

    return pages;
  };

  if (!contact) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl 
                   max-h-[95vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ══════════ HEADER (fixe) ══════════ */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center space-x-4 min-w-0">
            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center justify-center text-xl font-bold shrink-0">
              {contact.NomComplet?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-gray-800 truncate">
                {contact.NomComplet}
              </h2>
              <p className="text-xs text-gray-500">#{contact.id}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-600">
                <span className="truncate">✉️ {contact.adresseEmail || "N/A"}</span>
                <span className="truncate">📱 {contact.numeroTelephone || "N/A"}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition shrink-0"
            title="Fermer (Échap)"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* ══════════ BODY (scrollable) ══════════ */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => onSendEmail(contact)}
              disabled={!contact.adresseEmail}
              className="flex-1 btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaEnvelope className="mr-2" /> Email
            </button>
            <button
              onClick={() => onSendSms(contact)}
              disabled={!contact.numeroTelephone}
              className="flex-1 btn-success flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaSms className="mr-2" /> SMS
            </button>
            <button
              onClick={() => onEdit(contact)}
              className="px-4 py-2 border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 flex items-center transition"
              title="Modifier"
            >
              <FaEdit />
            </button>
          </div>

          {/* Stats */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Statistiques
            </h3>
            {statsLoading ? (
              <div className="flex justify-center py-6">
                <LoadingSpinner />
              </div>
            ) : (
              <ContactStatsCards stats={stats} />
            )}
          </div>

          {/* Historique */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Historique des envois
                {pagination.total > 0 && (
                  <span className="ml-2 text-gray-400 normal-case font-normal">
                    ({pagination.total})
                  </span>
                )}
              </h3>
            </div>

            {/* Filtres */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="all">Tous les types</option>
                <option value="email">📧 Emails</option>
                <option value="sms">💬 SMS</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Tous les statuts</option>
                <option value="sent">✅ Envoyés</option>
                <option value="failed">❌ Échoués</option>
                <option value="pending">⏳ En attente</option>
              </select>

              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-gray-500">Afficher</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* Liste */}
            {historyLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm bg-gray-50 rounded-lg">
                <FaInbox className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                Aucun envoi pour ce contact
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="flex items-center justify-between bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div
                        className={`p-2 rounded-lg shrink-0 ${
                          item.type === "email"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {item.type === "email" ? <FaEnvelope /> : <FaSms />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {item.subject || "(Sans sujet)"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(item.createdAt)} · {statusLabel(item.status)}
                        </p>
                      </div>
                    </div>
                    <div className="ml-3 shrink-0">
                      {statusIcon(item.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ══════════ FOOTER (fixe — pagination) ══════════ */}
        {pagination.total > 0 && (
          <div className="border-t border-gray-100 px-5 py-3 bg-gray-50/50 shrink-0">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-gray-500">
                Page <span className="font-semibold">{pagination.currentPage}</span>{" "}
                sur <span className="font-semibold">{pagination.totalPages}</span>{" "}
                · {pagination.total} résultat{pagination.total > 1 ? "s" : ""}
              </p>

              {pagination.totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => goToPage(1)}
                    disabled={pagination.currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    title="Première page"
                  >
                    <FaAngleDoubleLeft className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => goToPage(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    title="Précédent"
                  >
                    <FaChevronLeft className="w-3 h-3" />
                  </button>

                  {getPageNumbers().map((page, idx) =>
                    page === "..." ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-1 text-gray-400 select-none"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition ${
                          page === pagination.currentPage
                            ? "bg-blue-600 text-white shadow"
                            : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => goToPage(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    title="Suivant"
                  >
                    <FaChevronRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => goToPage(pagination.totalPages)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    title="Dernière page"
                  >
                    <FaAngleDoubleRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactDetailModal;