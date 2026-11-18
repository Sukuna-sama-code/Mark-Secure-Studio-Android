/**
 * Utility to manage browser tab favicon and brand logo dynamically.
 */

export const STORAGE_KEY_CUSTOM_LOGO = 'marksecure_custom_brand_logo';

/**
 * Updates the browser tab favicon in the document head.
 * Uses cache-busting or data URI to ensure Chrome immediately updates the tab.
 */
export function updateTabFavicon(iconUrl: string) {
  try {
    // Remove existing icon links to force Chrome/Firefox tab re-rendering
    const existingLinks = document.querySelectorAll("link[rel*='icon'], link[rel='apple-touch-icon']");
    existingLinks.forEach((el) => el.remove());

    const isDataUri = iconUrl.startsWith('data:');
    const isSvg = iconUrl.includes('.svg') || iconUrl.startsWith('data:image/svg+xml');

    const newLink = document.createElement('link');
    newLink.id = 'app-favicon';
    newLink.rel = 'icon';
    newLink.type = isSvg ? 'image/svg+xml' : 'image/png';
    // If not data URI, append timestamp to bypass aggressive browser favicon cache
    newLink.href = isDataUri ? iconUrl : `${iconUrl}${iconUrl.includes('?') ? '&' : '?'}v=${Date.now()}`;
    document.head.appendChild(newLink);

    // Also update apple-touch-icon
    const touchLink = document.createElement('link');
    touchLink.rel = 'apple-touch-icon';
    touchLink.href = newLink.href;
    document.head.appendChild(touchLink);
  } catch (err) {
    console.error('Failed to update tab favicon:', err);
  }
}

/**
 * Initializes favicon from localStorage if user previously uploaded one,
 * or ensures the official default logo favicon is loaded.
 */
export function initBrandFavicon(): string | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_LOGO);
    if (saved) {
      updateTabFavicon(saved);
      return saved;
    }
    // Official Default favicon
    updateTabFavicon('/favicon.png');
    return null;
  } catch {
    return null;
  }
}

/**
 * Saves a new custom logo to localStorage and updates browser favicon.
 */
export function saveCustomBrandLogo(dataUrl: string) {
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_LOGO, dataUrl);
    updateTabFavicon(dataUrl);
  } catch (err) {
    console.error('Failed to save custom logo to localStorage:', err);
  }
}

/**
 * Clears custom brand logo and restores official default logo.
 */
export function resetBrandLogo() {
  try {
    localStorage.removeItem(STORAGE_KEY_CUSTOM_LOGO);
    updateTabFavicon('/favicon.png');
  } catch (err) {
    console.error('Failed to reset brand logo:', err);
  }
}
