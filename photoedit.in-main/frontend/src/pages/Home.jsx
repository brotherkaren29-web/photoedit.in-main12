import { Link } from "react-router-dom";
import { Sparkles, Layers, Wand2, Crop, MousePointer2, Download, Shield, Zap } from "lucide-react";
import SiteLayout from "../components/SiteLayout";
import AdSlot from "../components/AdSlot";
import { SITE_NAME } from "../config";

const features = [
  { icon: Crop, title: "Crop, resize & rotate", body: "Trim screenshots to the exact size you need. Rotate in 90° steps and flip on either axis without losing quality." },
  { icon: Wand2, title: "Markup toolkit", body: "Brush, arrow, rectangle, ellipse, highlight, text and pixelate — everything you need to explain a screenshot in seconds." },
  { icon: Layers, title: "Adjust & filter", body: "Live brightness, contrast, grayscale, sepia and invert. Preview instantly and bake into the file on export." },
  { icon: MousePointer2, title: "Precise placement", body: "Click-to-place text, drag-to-draw shapes and interactive crop rectangles — like a real desktop editor in your browser." },
  { icon: Download, title: "Export anywhere", body: "One-click PNG or JPG download. Nothing leaves your device — all editing happens locally in your browser." },
  { icon: Shield, title: "Private by default", body: "No accounts. No uploads to a server. Your images stay in your browser tab from start to finish." },
];

const steps = [
  { n: "01", title: "Open your image", body: "Drop a file, paste from the clipboard, or capture your screen straight from the browser — whichever is fastest." },
  { n: "02", title: "Mark it up", body: "Draw, highlight, add arrows, blur sensitive information or type on top. Every stroke is flattened into a single image." },
  { n: "03", title: "Export the result", body: "Download a merged PNG or JPG. Ready for docs, tickets, chats or your camera roll." },
];

export default function Home() {
  return (
    <SiteLayout>
      <section className="hero" data-testid="hero-section">
        <div className="hero-copy">
          <span className="page-eyebrow"><Sparkles size={14} /> Browser-based editor</span>
          <h1 data-testid="hero-title">A fast image & screenshot editor that just opens.</h1>
          <p className="hero-lede">
            {SITE_NAME} is a free, no-signup image editor built for the web. Open a photo, annotate a screenshot,
            adjust colors, and export in seconds — everything runs locally in your browser.
          </p>
          <div className="hero-cta">
            <Link to="/editor" className="btn-primary" data-testid="cta-open-editor"><Zap size={16} /> Open the editor</Link>
            <Link to="/about" className="btn-ghost" data-testid="cta-learn-more">Learn more</Link>
          </div>
          <div className="hero-meta">
            <span>No account required</span><span>·</span><span>Runs in your browser</span><span>·</span><span>Free forever</span>
          </div>
        </div>
        <div className="hero-preview" aria-hidden="true">
          <div className="preview-window">
            <div className="preview-chrome"><i /><i /><i /></div>
            <div className="preview-canvas">
              <div className="preview-image" />
              <div className="preview-arrow" />
              <div className="preview-text">Ship it 🚀</div>
              <div className="preview-highlight" />
            </div>
          </div>
        </div>
      </section>

      <AdSlot slot="1111111111" className="ad-banner" />

      <section className="features" data-testid="features-section">
        <h2>Everything you need for a quick edit</h2>
        <div className="feature-grid">
          {features.map((f) => (
            <div className="feature-card" key={f.title} data-testid={`feature-${f.title.split(" ")[0].toLowerCase()}`}>
              <span className="feature-icon"><f.icon size={20} /></span>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="steps" data-testid="steps-section">
        <h2>Three steps from raw file to ready-to-share</h2>
        <div className="step-grid">
          {steps.map((s) => (
            <div className="step-card" key={s.n}>
              <span className="step-num">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
        <Link to="/editor" className="btn-primary center" data-testid="cta-open-editor-bottom"><Zap size={16} /> Start editing</Link>
      </section>

      <AdSlot slot="2222222222" className="ad-banner" />

      <section className="rich-content" data-testid="how-to-section">
        <h2>How to edit an image or screenshot in photoedit.in</h2>
        <p>
          {SITE_NAME} is built to make small edits feel effortless. You do not need to install
          software, sign up, or hand your files over to a stranger&rsquo;s server. Every action described
          below happens inside the tab you are already in, using the same drawing engine that ships
          with your browser. This is the walkthrough for the most common workflow — annotating a
          screenshot before sharing it — but you can apply the same steps to any photo you want to
          tidy up before uploading it somewhere else.
        </p>
        <ol className="doc-list">
          <li>
            <strong>Open your image.</strong> Drop a file into the editor, paste from your clipboard,
            or capture the screen with the browser capture button. Anything that lands on the canvas
            can be edited immediately.
          </li>
          <li>
            <strong>Choose a tool from the left rail.</strong> Use the brush, arrow, rectangle,
            ellipse, highlighter or text tool to annotate. The options bar at the top gives you a
            colour picker, a size slider, six recent-colour swatches, a fill toggle for shapes,
            and a dedicated size and font picker for text.
          </li>
          <li>
            <strong>Move things around when you need to.</strong> Text you place stays as a live
            layer — click it later to reword, restyle or drag it to a new spot. Hold spacebar with
            any tool active to pan the canvas around like in a professional editor. Ctrl + mouse
            wheel (or a trackpad pinch) zooms.
          </li>
          <li>
            <strong>Adjust colours &amp; filters.</strong> The right panel has brightness, contrast
            and quick filter selects. These are live previews only until you use the Filter menu to
            bake a filter permanently into the image.
          </li>
          <li>
            <strong>Export or save a draft.</strong> The top-right export button downloads a PNG or
            JPG. If you are not done yet, use the Drafts tab to keep multiple named versions inside
            the browser so you can come back to them later. Auto-save runs every minute in the
            background as a safety net.
          </li>
        </ol>

        <h2>Features you can rely on</h2>
        <ul className="doc-list">
          <li><strong>Crop, resize, rotate and flip</strong> at pixel accuracy without losing your annotations.</li>
          <li><strong>Interactive text layers</strong> that stay editable until you decide to flatten them.</li>
          <li><strong>Drafts with hover previews</strong> and a one-click ZIP export so you can move your work between devices.</li>
          <li><strong>Undo / redo</strong> that snapshots up to 30 states of your canvas.</li>
          <li><strong>Move tool with real translation</strong> — pan the image at any zoom level, not just when it overflows.</li>
          <li><strong>Screenshot pipeline</strong>: upload, clipboard paste and browser screen capture, all from the same toolbar.</li>
        </ul>

        <h2>Frequently asked questions</h2>
        <div className="faq">
          <div className="faq-item"><h3>Is photoedit.in really free?</h3>
            <p>
              Yes. There is no paid tier, no watermark on your exports and no signup wall. The
              project is funded by unobtrusive third-party advertising delivered by Google AdSense —
              you can read more about that in our{" "}
              <Link to="/privacy" data-testid="home-privacy-link">Privacy Policy</Link>.
            </p>
          </div>
          <div className="faq-item"><h3>Where are my images stored?</h3>
            <p>
              Nowhere on our servers. Your image is processed entirely in your browser tab using
              standard web APIs (HTMLCanvasElement, Clipboard API, Screen Capture API). Drafts are
              saved to your browser&rsquo;s local storage — they never leave your device.
            </p>
          </div>
          <div className="faq-item"><h3>Do I need an account?</h3>
            <p>
              No account, no email, no sign-in. Open the editor and start working. If you close the
              tab without saving a draft, your session is gone.
            </p>
          </div>
          <div className="faq-item"><h3>Which browsers work best?</h3>
            <p>
              {SITE_NAME} is tested on the latest Chrome, Edge, Firefox and Safari. Screen capture
              and clipboard-paste require permission prompts from the browser, which some corporate
              policies may block. File upload always works as a fallback.
            </p>
          </div>
          <div className="faq-item"><h3>Can I use my edits commercially?</h3>
            <p>
              You own the images you edit. {SITE_NAME} does not claim any rights over the content
              you produce. Just make sure the source image is one you have the right to use — see
              our{" "}
              <Link to="/terms" data-testid="home-terms-link">Terms &amp; Conditions</Link>{" "}
              for full details.
            </p>
          </div>
          <div className="faq-item"><h3>How do you handle privacy and analytics?</h3>
            <p>
              We use privacy-respecting analytics to understand aggregate usage patterns. We do not
              upload the images you edit. Advertising cookies come from Google AdSense — full
              disclosure is on our{" "}
              <Link to="/privacy" data-testid="home-privacy-link-2">Privacy Policy</Link> page.
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
