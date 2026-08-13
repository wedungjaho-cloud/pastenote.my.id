/**
 * PasteNote — Landing v5 Preview
 */
import { layout } from './layout.js';
import { Router } from '../router.js';

export function renderLanding() {
  return Router.htmlResponse(layout({
    title: 'PasteNote',
    bodyClass: 'landing',
    body: `
    <main class="landing-shell">
      <section class="landing-panel">
        <div class="landing-brandline">
          <span class="landing-mark" aria-hidden="true"></span>
          <span class="landing-kicker">PRIVATE NOTE SPACE</span>
        </div>

        <div class="landing-copy">
          <h1 class="landing-title">Your notes, quietly<br><em>kept in one place.</em></h1>
          <p class="landing-lede">PasteNote is a private space for notes and inbox access. No public feed, no noise — just the page you were given.</p>
        </div>

        <div class="landing-access">
          <div class="landing-access-head">
            <span class="label">ACCESS</span>
            <span class="landing-access-note">Admin-issued link</span>
          </div>
          <div class="landing-url"><span>pastenote.my.id/</span><strong>email@outlook.com</strong></div>
          <div class="landing-rule"></div>
          <div class="landing-step"><span>01</span><p>Open the full link provided by your admin.</p></div>
          <div class="landing-step"><span>02</span><p>Enter the password that came with it.</p></div>
          <div class="landing-step"><span>03</span><p>Your private notes and inbox appear after unlock.</p></div>
        </div>

        <p class="landing-footnote">No link or password? There is nothing to sign up for here.</p>

        <footer class="landing-foot">
          <span class="landing-foot-dot" aria-hidden="true"></span>
          <span class="landing-foot-text">pastenote · private note space</span>
        </footer>
      </section>
    </main>`,
  }));
}
