// === Blocage des requêtes réseau ===
// Redéfinition de fetch pour bloquer les URLs publicitaires
const blockedDomains = [
  'doubleclick.net',
  'googlesyndication.com',
  'googleadservices.com',
  'adservice.google.com',
  'youtube.com/api/stats/ads', // endpoint publicitaire YouTube
  'youtubei/v1/player/ad_break', // publicités vidéo
  'youtubei/v1/next', // parfois contient des pubs
  'youtubei/v1/browse', // parfois contient des pubs
  'youtubei/v1/search', // parfois contient des pubs
  'youtube.com/ptracking',
  'youtube.com/pagead',
  'youtube.com/get_midroll_info',
  'youtube.com/api/stats/watchtime',
  'youtube.com/youtubei/v1/log_event',
  'youtube.com/youtubei/v1/player',
];

function isBlocked(url) {
  return blockedDomains.some(domain => url.includes(domain));
}

const originalFetch = window.fetch;
window.fetch = function(...args) {
  const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
  if (url && isBlocked(url)) {
    console.log('[AdBlock] Requête bloquée:', url);
    return Promise.reject(new Error('Requête bloquée par adblock'));
  }
  return originalFetch.apply(this, args);
};

// Redéfinition de XMLHttpRequest.open
const originalXHROpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url, ...rest) {
  if (isBlocked(url)) {
    console.log('[AdBlock] XHR bloquée:', url);
    // On peut lever une erreur ou simplement ne pas envoyer la requête
    throw new Error('Requête bloquée par adblock');
  }
  return originalXHROpen.call(this, method, url, ...rest);
};

// === Suppression des éléments publicitaires dans le DOM ===
function removeAdElements() {
  // Sélecteurs courants pour les publicités YouTube Music
  const selectors = [
    'ytmusic-mealbar-promo-renderer', // bannière promo
    'ytmusic-banner-promo-renderer',
    'ytmusic-carousel-shelf-renderer', // parfois des promos
    'ytmusic-tastebuilder-shelf-renderer',
    'ytmusic-message-renderer', // messages "Essayez Premium"
    '.ad-container',
    '.ytp-ad-overlay-container',
    '.ytp-ad-player-overlay',
    '[class*="ad-"]',
    '[id*="ad-"]',
    '[class*="promo"]',
    '[id*="promo"]',
    'tp-yt-paper-dialog', // popups
    '.upsell-dialog',
    'ytmusic-popup-container',
  ];

  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      el.remove();
      console.log('[AdBlock] Élément supprimé:', selector);
    });
  });
}

// Observer les changements du DOM pour supprimer les pubs dynamiquement
const observer = new MutationObserver(() => {
  removeAdElements();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Nettoyage initial
window.addEventListener('load', () => {
  removeAdElements();
  // Attendre un peu pour que les pubs se chargent puis les supprimer
  setTimeout(removeAdElements, 5000);
  setTimeout(removeAdElements, 15000);
});

console.log('[AdBlock] Script de blocage injecté avec succès.');