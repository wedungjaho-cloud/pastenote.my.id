/**
 * PasteNote — CSS Concatenator
 * Imports all .css files and concatenates them in correct order.
 */

import globalCSS from '../styles/global.css';
import componentsCSS from '../styles/components.css';
import headerCSS from '../styles/header.css';
import pagesCSS from '../styles/pages.css';
import inboxCSS from '../styles/inbox.css';
import adminCSS from '../styles/admin.css';
import responsiveCSS from '../styles/responsive.css';

/**
 * Get all CSS concatenated in dependency order.
 * @returns {string}
 */
export function getAllCSS() {
  return [
    globalCSS,
    componentsCSS,
    headerCSS,
    pagesCSS,
    inboxCSS,
    adminCSS,
    responsiveCSS,
  ].join('\n');
}
