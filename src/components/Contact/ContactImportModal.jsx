import React, { useState } from 'react';
import { FaFileCsv, FaUpload, FaTimes, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { contactService } from '../../api/api';
import Toast from '../Common/Toast';
import LoadingSpinner from '../Common/LoadingSpinner';

const ContactImportModal = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!f.name.endsWith('.csv')) {
      setToast({ message: "Format CSV requis", type: "error" });
      return;
    }

    setFile(f);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = parseCsv(text);
      setPreview(rows.slice(0, 5)); // aperçu 5 premières lignes
    };
    reader.readAsText(f);
  };

  // Parser CSV simple (gère " et ,)
  const parseCsv = (text) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));

    return lines.slice(1).map((line) => {
      // Regex pour respecter les guillemets
      const values = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = values[i]?.replace(/^"|"$/g, '') || '';
      });
      return obj;
    });
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const rows = parseCsv(event.target.result);

        if (rows.length === 0) {
          setToast({ message: "Le fichier CSV est vide", type: "error" });
          setLoading(false);
          return;
        }

        const res = await contactService.importCsv({ contacts: rows });
        setResult(res.data);
        setToast({ message: res.data.message, type: "success" });

        setTimeout(() => {
          onSuccess?.();
        }, 2000);
      };
      reader.readAsText(file);
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Erreur d'import",
        type: "error",
      });
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            <FaFileCsv className="text-blue-500 mr-2" />
            Importer des contacts (CSV)
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <FaTimes />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Zone upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer block">
              <FaUpload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
              <p className="text-sm font-medium text-gray-700">
                {file ? file.name : "Cliquez pour choisir un fichier CSV"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Format : NomComplet, adresseEmail, numeroTelephone
              </p>
            </label>
          </div>

          {/* Format attendu */}
          <div className="bg-gray-50 rounded-lg p-3 text-xs font-mono text-gray-600 overflow-x-auto">
            <p className="text-gray-400 mb-1">Exemple :</p>
            <p>NomComplet,adresseEmail,numeroTelephone</p>
            <p>Jean Dupont,jean@mail.com,0341234567</p>
            <p>Marie Curie,marie@mail.com,+261341234568</p>
          </div>

          {/* Aperçu */}
          {preview.length > 0 && !result && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Aperçu ({preview.length} premières lignes)
              </p>
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(preview[0]).map((h) => (
                        <th key={h} className="px-3 py-2 text-left font-medium text-gray-600">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-t">
                        {Object.values(row).map((v, j) => (
                          <td key={j} className="px-3 py-1.5 text-gray-700">
                            {v || "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Résultat */}
          {result && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-lg p-3">
                <FaCheckCircle />
                <span className="text-sm font-medium">
                  {result.successCount} contact(s) importé(s)
                </span>
              </div>

              {result.errorCount > 0 && (
                <div className="bg-orange-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-orange-600 mb-2">
                    <FaExclamationTriangle />
                    <span className="text-sm font-medium">
                      {result.errorCount} erreur(s)
                    </span>
                  </div>
                  <ul className="text-xs text-orange-700 space-y-1 max-h-32 overflow-y-auto">
                    {result.errors?.map((e, i) => (
                      <li key={i}>• Ligne {e.line} : {e.message}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t mt-4 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {result ? "Fermer" : "Annuler"}
          </button>
          {!result && (
            <button
              onClick={handleImport}
              disabled={loading || !file}
              className="flex-1 btn-primary flex items-center justify-center disabled:opacity-50"
            >
              {loading ? (
                <><LoadingSpinner size="sm" /><span className="ml-2">Import...</span></>
              ) : (
                <><FaUpload className="mr-2" /> Importer</>
              )}
            </button>
          )}
        </div>

        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
};

export default ContactImportModal;