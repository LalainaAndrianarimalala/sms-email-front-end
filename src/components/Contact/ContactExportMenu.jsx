import React, { useState, useRef, useEffect } from 'react';
import {
  FaDownload,
  FaFileCsv,
  FaFileExcel,
  FaFileCode,
  FaFileAlt,
  FaFile,
  FaChevronDown,
  FaCog,
} from 'react-icons/fa';
import { contactService } from '../../api/api';
import { downloadBlob, getFilenameFromHeaders } from '../../utils/download';
import LoadingSpinner from '../Common/LoadingSpinner';
import Toast from '../Common/Toast';

// ── Icônes + libellés par format ──
const FORMAT_META = {
  csv:  { icon: FaFileCsv,   color: 'text-green-600',  bg: 'bg-green-100',   label: 'CSV',        desc: 'Excel, Google Sheets' },
  xlsx: { icon: FaFileExcel, color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Excel (.xlsx)', desc: 'Format moderne avec styles' },
  xls:  { icon: FaFileExcel, color: 'text-emerald-700', bg: 'bg-emerald-50',  label: 'Excel (.xls)', desc: 'Compatibilité ancienne' },
  ods:  { icon: FaFileExcel, color: 'text-orange-600',  bg: 'bg-orange-100',  label: 'OpenDocument', desc: 'LibreOffice / OpenOffice' },
  tsv:  { icon: FaFile,      color: 'text-purple-600',  bg: 'bg-purple-100',  label: 'TSV',        desc: 'Tabulations' },
  json: { icon: FaFileCode,  color: 'text-yellow-600',  bg: 'bg-yellow-100',  label: 'JSON',       desc: 'Pour développeurs' },
  html: { icon: FaFileAlt,   color: 'text-blue-600',    bg: 'bg-blue-100',    label: 'HTML',       desc: 'Tableau imprimable' },
};

const ContactExportMenu = ({
  search = '',
  includeInactive = false,
  fromDate = '',
  toDate = '',
}) => {
  const [open, setOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(null);
  const [toast, setToast] = useState(null);
  const menuRef = useRef(null);

  // Options avancées
  const [selectedFields, setSelectedFields] = useState([]);
  const [availableFields, setAvailableFields] = useState([]);
  const [availableFormats, setAvailableFormats] = useState(Object.keys(FORMAT_META));

  // Charger les options dispo depuis le back
  useEffect(() => {
    (async () => {
      try {
        const res = await contactService.getExportOptions();
        setAvailableFields(res.data.fields || []);
        setAvailableFormats(res.data.formats || Object.keys(FORMAT_META));
      } catch (err) {
        console.error('Erreur chargement options export:', err);
      }
    })();
  }, []);

  // Fermer au clic extérieur
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggleField = (key) => {
    setSelectedFields((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleExport = async (format) => {
    try {
      setLoading(format);
      setOpen(false);

      const params = {
        format,
        search,
        includeInactive,
        fromDate,
        toDate,
        fields: selectedFields.length > 0 ? selectedFields.join(',') : undefined,
      };

      const res = await contactService.exportContacts(params);

      const fallback = `contacts_${new Date().toISOString().split('T')[0]}.${FORMAT_META[format]?.label.split(' ')[0].toLowerCase() || format}`;
      const filename = getFilenameFromHeaders(res.headers, fallback);

      downloadBlob(res.data, filename);

      const count = res.headers['x-export-count'] || '?';
      setToast({
        message: `${count} contact(s) exporté(s) en ${format.toUpperCase()}`,
        type: 'success',
      });
    } catch (err) {
      console.error(err);
      setToast({
        message: `Erreur export ${format.toUpperCase()}`,
        type: 'error',
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        disabled={loading !== null}
        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center text-gray-700 disabled:opacity-50 transition"
      >
        {loading ? (
          <><LoadingSpinner size="sm" /><span className="ml-2">Export...</span></>
        ) : (
          <><FaDownload className="mr-2" />Exporter<FaChevronDown className={`ml-2 w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} /></>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-30 overflow-hidden">

          {/* Onglets simples / avancé */}
          <div className="flex border-b border-gray-100 bg-gray-50/50">
            <button
              onClick={() => setShowAdvanced(false)}
              className={`flex-1 px-4 py-2 text-sm font-medium transition ${
                !showAdvanced ? 'text-blue-600 bg-white' : 'text-gray-500'
              }`}
            >
              Rapide
            </button>
            <button
              onClick={() => setShowAdvanced(true)}
              className={`flex-1 px-4 py-2 text-sm font-medium transition flex items-center justify-center ${
                showAdvanced ? 'text-blue-600 bg-white' : 'text-gray-500'
              }`}
            >
              <FaCog className="mr-1 w-3 h-3" /> Avancé
            </button>
          </div>

          {/* Champs personnalisés (mode avancé) */}
          {showAdvanced && availableFields.length > 0 && (
            <div className="px-4 py-3 border-b border-gray-100 bg-blue-50/30">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Colonnes à exporter
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {availableFields.map((f) => (
                  <label
                    key={f.key}
                    className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer hover:bg-white/60 rounded px-1.5 py-1"
                  >
                    <input
                      type="checkbox"
                      checked={
                        selectedFields.length === 0 ||
                        selectedFields.includes(f.key)
                      }
                      onChange={() => toggleField(f.key)}
                      className="w-3.5 h-3.5 text-blue-600 rounded"
                    />
                    <span className="truncate">{f.label}</span>
                  </label>
                ))}
              </div>
              {selectedFields.length > 0 && (
                <button
                  onClick={() => setSelectedFields([])}
                  className="text-xs text-blue-600 hover:underline mt-2"
                >
                  Réinitialiser (tous les champs)
                </button>
              )}
            </div>
          )}

          {/* Liste des formats */}
          <div className="max-h-80 overflow-y-auto">
            {availableFormats.map((fmt, idx) => {
              const meta = FORMAT_META[fmt];
              if (!meta) return null;
              const Icon = meta.icon;

              return (
                <button
                  key={fmt}
                  onClick={() => handleExport(fmt)}
                  className={`w-full px-4 py-2.5 flex items-center text-left hover:bg-gray-50 transition ${
                    idx > 0 ? 'border-t border-gray-100' : ''
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg ${meta.bg} flex items-center justify-center mr-3 shrink-0`}>
                    <Icon className={meta.color} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800">{meta.label}</p>
                    <p className="text-xs text-gray-500 truncate">{meta.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Info filtres actifs */}
          {(search || includeInactive || fromDate || toDate) && (
            <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-100">
              <p className="text-xs text-yellow-700">
                ⚠️ Filtres actifs appliqués :
                {search && ` recherche "${search}"`}
                {includeInactive && ' · inclut inactifs'}
                {fromDate && ` · depuis ${fromDate}`}
                {toDate && ` · jusqu'à ${toDate}`}
              </p>
            </div>
          )}
        </div>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default ContactExportMenu;