import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaEnvelope,
  FaSms,
  FaSearch,
  FaPlus,
  FaEdit,
  FaEye,
  FaTrash,
  FaFileCsv,
  FaTimes,
} from "react-icons/fa";

import Layout from "../components/Layout/Layout";
import LoadingSpinner from "../components/Common/LoadingSpinner";
import Toast from "../components/Common/Toast";

import SendEmailToContactModal from "../components/Contact/SendEmailToContactModal";
import SendSmsToContactModal from "../components/Contact/SendSmsToContactModal";
import ContactFormModal from "../components/Contact/ContactFormModal";
import ContactDetailModal from "../components/Contact/ContactDetailModal";
import BulkSendModal from "../components/Contact/BulkSendModal";
import ContactImportModal from "../components/Contact/ContactImportModal";
import ContactExportMenu from "../components/Contact/ContactExportMenu";

import { contactService } from "../api/api";

const ContactPage = () => {
  // ── Données ──
  const [contacts, setContacts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  // ── Modales ──
  const [emailTarget, setEmailTarget] = useState(null);
  const [smsTarget, setSmsTarget] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);

  // ── Bulk ──
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkMode, setBulkMode] = useState(null); // 'email' | 'sms' | null

  // ── Soft delete ──
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ═══════════════════════════════════════════
  // Chargement initial
  // ═══════════════════════════════════════════
  useEffect(() => {
    fetchContacts();
  }, []);

  // ═══════════════════════════════════════════
  // Filtre recherche
  // ═══════════════════════════════════════════
  useEffect(() => {
    const s = search.toLowerCase().trim();
    if (!s) {
      setFiltered(contacts);
      return;
    }
    setFiltered(
      contacts.filter(
        (c) =>
          c.NomComplet?.toLowerCase().includes(s) ||
          c.adresseEmail?.toLowerCase().includes(s) ||
          c.numeroTelephone?.includes(s)
      )
    );
  }, [search, contacts]);

  // ═══════════════════════════════════════════
  // Reset sélection quand la liste change
  // ═══════════════════════════════════════════
  useEffect(() => {
    // Retirer les IDs qui ne sont plus dans la liste filtrée
    setSelectedIds((prev) =>
      prev.filter((id) => filtered.some((c) => c.id === id))
    );
  }, [filtered]);

  // ═══════════════════════════════════════════
  // API
  // ═══════════════════════════════════════════
  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await contactService.list({ limit: 200 });
      setContacts(res.data.data || []);
    } catch (err) {
      console.error(err);
      setToast({ message: "Erreur chargement contacts", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await contactService.deleteContact(deleteTarget.id);
      setToast({
        message: `Contact "${deleteTarget.NomComplet}" désactivé`,
        type: "success",
      });
      setDeleteTarget(null);
      fetchContacts();
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Erreur lors de la suppression",
        type: "error",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // ═══════════════════════════════════════════
  // Sélection
  // ═══════════════════════════════════════════
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((c) => c.id));
    }
  };

  const selectedContacts = contacts.filter((c) => selectedIds.includes(c.id));

  const allSelected =
    filtered.length > 0 && selectedIds.length === filtered.length;

  // ═══════════════════════════════════════════
  // Loading
  // ═══════════════════════════════════════════
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  // ═══════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════
  return (
    <Layout>
      <div className="space-y-6 pb-24">
        {/* ═══════ En-tête ═══════ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <FaUsers className="text-purple-500 mr-3" />
              Contacts
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {filtered.length} contact{filtered.length > 1 ? "s" : ""}
              {search && ` (sur ${contacts.length})`}
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <ContactExportMenu search={search} />
            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center text-gray-700"
            >
              <FaFileCsv className="mr-2" /> Importer CSV
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center justify-center"
            >
              <FaPlus className="mr-2" /> Nouveau contact
            </button>
          </div>
        </div>

        {/* ═══════ Recherche ═══════ */}
        <div className="card">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou téléphone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* ═══════ Barre sélection ═══════ */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                className="w-4 h-4 text-blue-600 rounded"
              />
              Tout sélectionner ({filtered.length})
            </label>

            {selectedIds.length > 0 && (
              <span className="text-xs text-blue-600 font-medium">
                {selectedIds.length} sélectionné(s)
              </span>
            )}
          </div>
        )}

        {/* ═══════ Liste ═══════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="card col-span-full text-center py-8 text-gray-500">
              <FaUsers className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Aucun contact trouvé</p>
              {search && (
                <p className="text-sm text-gray-400 mt-1">
                  Essayez avec un autre terme de recherche
                </p>
              )}
            </div>
          ) : (
            filtered.map((contact) => {
              const isSelected = selectedIds.includes(contact.id);
              return (
                <div
                  key={contact.id}
                  className={`card hover:shadow-lg transition cursor-pointer relative ${
                    isSelected ? "ring-2 ring-blue-500 bg-blue-50/30" : ""
                  }`}
                  onClick={() => setDetailTarget(contact)}
                >
                  {/* Ligne 1 : checkbox + avatar + nom + actions */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleSelect(contact.id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 text-blue-600 rounded cursor-pointer shrink-0"
                      />
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center justify-center font-bold shrink-0">
                        {contact.NomComplet?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {contact.NomComplet}
                        </h3>
                        <p className="text-xs text-gray-500">#{contact.id}</p>
                      </div>
                    </div>

                    <div className="flex shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditTarget(contact);
                        }}
                        className="p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition"
                        title="Modifier"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(contact);
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Désactiver"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Ligne 2 : infos */}
                  <div className="space-y-1 mb-4">
                    <p
                      className={`text-sm truncate ${
                        contact.adresseEmail
                          ? "text-gray-600"
                          : "text-gray-400 italic"
                      }`}
                    >
                      ✉️ {contact.adresseEmail || "Aucun email"}
                    </p>
                    <p
                      className={`text-sm truncate ${
                        contact.numeroTelephone
                          ? "text-gray-600"
                          : "text-gray-400 italic"
                      }`}
                    >
                      📱 {contact.numeroTelephone || "Aucun téléphone"}
                    </p>
                  </div>

                  {/* Ligne 3 : actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDetailTarget(contact);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition"
                      title="Voir le détail"
                    >
                      <FaEye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEmailTarget(contact);
                      }}
                      disabled={!contact.adresseEmail}
                      className="flex-1 btn-primary text-sm py-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaEnvelope className="mr-1" /> Email
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSmsTarget(contact);
                      }}
                      disabled={!contact.numeroTelephone}
                      className="flex-1 btn-success text-sm py-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaSms className="mr-1" /> SMS
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ═══════ Barre flottante Bulk ═══════ */}
        {selectedIds.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white shadow-2xl rounded-2xl px-4 py-3 flex items-center gap-3 border border-gray-200 animate-in fade-in slide-in-from-bottom">
            <span className="text-sm font-medium text-gray-700">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs rounded-full mr-2">
                {selectedIds.length}
              </span>
              sélectionné(s)
            </span>
            <div className="w-px h-6 bg-gray-200" />
            <button
              onClick={() => setBulkMode("email")}
              className="btn-primary text-sm flex items-center py-1.5"
            >
              <FaEnvelope className="mr-1" /> Email
            </button>
            <button
              onClick={() => setBulkMode("sms")}
              className="btn-success text-sm flex items-center py-1.5"
            >
              <FaSms className="mr-1" /> SMS
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
              title="Annuler la sélection"
            >
              <FaTimes />
            </button>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════
          MODALES
      ═══════════════════════════════════════════ */}

      {/* Envoi email individuel */}
      {emailTarget && (
        <SendEmailToContactModal
          contact={emailTarget}
          onClose={() => setEmailTarget(null)}
          onSuccess={() =>
            setToast({ message: "Email envoyé !", type: "success" })
          }
        />
      )}

      {/* Envoi SMS individuel */}
      {smsTarget && (
        <SendSmsToContactModal
          contact={smsTarget}
          onClose={() => setSmsTarget(null)}
          onSuccess={() =>
            setToast({ message: "SMS envoyé !", type: "success" })
          }
        />
      )}

      {/* Création */}
      {showCreateModal && (
        <ContactFormModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchContacts();
            setToast({ message: "Contact créé !", type: "success" });
          }}
        />
      )}

      {/* Édition */}
      {editTarget && (
        <ContactFormModal
          contact={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={() => {
            fetchContacts();
            setToast({ message: "Contact mis à jour !", type: "success" });
          }}
        />
      )}

      {/* Détail */}
      {detailTarget && (
        <ContactDetailModal
          contact={detailTarget}
          onClose={() => setDetailTarget(null)}
          onSendEmail={(c) => {
            setDetailTarget(null);
            setEmailTarget(c);
          }}
          onSendSms={(c) => {
            setDetailTarget(null);
            setSmsTarget(c);
          }}
          onEdit={(c) => {
            setDetailTarget(null);
            setEditTarget(c);
          }}
        />
      )}

      {/* Envoi groupé */}
      {bulkMode && (
        <BulkSendModal
          mode={bulkMode}
          contacts={selectedContacts}
          onClose={() => setBulkMode(null)}
          onSuccess={() => {
            setToast({ message: "Envoi groupé effectué !", type: "success" });
            setSelectedIds([]);
          }}
        />
      )}

      {/* Import CSV */}
      {showImportModal && (
        <ContactImportModal
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            fetchContacts();
            setToast({ message: "Import terminé !", type: "success" });
          }}
        />
      )}

      {/* Confirmation soft delete */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <FaTrash className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">
                Désactiver ce contact ?
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Le contact <strong>{deleteTarget.NomComplet}</strong> sera
              désactivé (soft delete). Il ne sera plus visible dans la liste
              mais ses données restent en base.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 btn-danger flex items-center justify-center disabled:opacity-50"
              >
                {deleteLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Suppression...</span>
                  </>
                ) : (
                  "Confirmer"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast global */}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </Layout>
  );
};

export default ContactPage;
