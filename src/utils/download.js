/**
 * Déclenche le téléchargement d'un blob dans le navigateur.
 *
 * @param {Blob} blob       - Le fichier binaire reçu (axios responseType: 'blob')
 * @param {string} filename - Nom du fichier proposé à l'utilisateur
 */
export function downloadBlob(blob, filename = 'export.bin') {
  if (!blob) {
    console.error('downloadBlob: blob manquant');
    return;
  }

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;

  // Ajout au DOM (nécessaire pour Firefox)
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Libérer la mémoire
  window.URL.revokeObjectURL(url);
}

/**
 * Extrait le nom de fichier depuis les headers HTTP Content-Disposition.
 *
 * Supporte les formats :
 *   - attachment; filename="contacts.csv"
 *   - attachment; filename=contacts.csv
 *   - attachment; filename*=UTF-8''contacts%20test.csv
 *
 * @param {Object} headers  - Les headers axios (res.headers)
 * @param {string} fallback - Nom par défaut si introuvable
 * @returns {string}
 */
export function getFilenameFromHeaders(headers, fallback = 'export') {
  if (!headers) return fallback;

  // axios v1 : headers est un objet simple ; normalise les clés en lowercase
  const cd =
    headers['content-disposition'] ||
    headers['Content-Disposition'] ||
    '';

  if (!cd) return fallback;

  // 1) Essayer filename*=UTF-8''xxx (RFC 5987)
  const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(cd);
  if (utf8Match && utf8Match[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      return utf8Match[1];
    }
  }

  // 2) Essayer filename="xxx" ou filename=xxx
  const simpleMatch = /filename="?([^";]+)"?/i.exec(cd);
  if (simpleMatch && simpleMatch[1]) {
    return simpleMatch[1].trim();
  }

  return fallback;
}

/**
 * Helper : télécharge un blob avec le nom extrait automatiquement.
 *
 * @param {Object} response - La réponse axios complète (res, pas res.data)
 * @param {string} fallback - Nom par défaut
 */
export function downloadFromResponse(response, fallback = 'export') {
  const filename = getFilenameFromHeaders(response.headers, fallback);
  downloadBlob(response.data, filename);
}