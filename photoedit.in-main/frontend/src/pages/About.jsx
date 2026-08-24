import SiteLayout from "../components/SiteLayout";
import AdSlot from "../components/AdSlot";
import { SITE_NAME, CONTACT_EMAIL, LAUNCH_YEAR } from "../config";

export default function About() {
  return (
    <SiteLayout
      title="About photoedit.in"
      subtitle="A free browser image editor built for quick, private edits."
    >
      <article className="doc" data-testid="about-content">
        <p>
          {SITE_NAME} is an independent web application that lets you open a photo or screenshot, annotate it,
          apply adjustments and export a merged file — all inside your browser tab. It was built for the moments
          when downloading a desktop editor feels like overkill: cropping a receipt, circling a bug in a
          screenshot, blurring a name on a chat, resizing an image before uploading it somewhere.
        </p>

        <h2>Our mission</h2>
        <p>
          Most people don’t need Photoshop for a five-second edit. They just need a tool that opens instantly,
          works without an account and doesn’t send their files anywhere. That is the entire product goal of
          {" "}{SITE_NAME}: a fast, private, browser-based image editor that anyone can use.
        </p>

        <h2>What you can do here</h2>
        <ul>
          <li>Open images from your device, clipboard or a browser screen capture.</li>
          <li>Crop, resize, rotate and flip pictures.</li>
          <li>Annotate with brush, arrow, rectangle, ellipse, highlight, pixelate and text tools.</li>
          <li>Adjust brightness and contrast, or apply grayscale, sepia and invert filters.</li>
          <li>Undo and redo anything you don’t like.</li>
          <li>Export a merged PNG or JPG when you are happy with the result.</li>
        </ul>

        <h2>Privacy first</h2>
        <p>
          The editor runs entirely inside your browser using standard web APIs like HTMLCanvasElement,
          the Clipboard API and the Screen Capture API. Your images are never uploaded to a server owned by
          {" "}{SITE_NAME}. Once you close the tab, nothing is retained. Please read our{" "}
          <a href="/privacy" data-testid="about-privacy-link">Privacy Policy</a> for the full picture.
        </p>

        <h2>Who is behind this?</h2>
        <p>
          {SITE_NAME} is a small independent project launched in {LAUNCH_YEAR}. It is maintained by a solo
          developer who wanted a friendlier browser editor for everyday image tasks. If you spot a bug,
          have a feature request or just want to say hello, please write to{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} data-testid="about-contact-email">{CONTACT_EMAIL}</a>.
        </p>

        <h2>Advertising</h2>
        <p>
          {SITE_NAME} is free to use. To keep the lights on and the servers running, we display advertising
          delivered by Google AdSense on the site. These ads help fund development but never gain access to
          the images you edit. You can learn more on our{" "}
          <a href="/privacy" data-testid="about-privacy-link-2">Privacy Policy</a> page.
        </p>

        <AdSlot slot="3333333333" className="ad-inline" />

        <h2>What is next?</h2>
        <p>
          We are continually improving the editor. Planned features include richer selection tools,
          layers with blending modes, more filters, mobile touch gestures and the ability to save and reopen
          projects locally without any signup. If there is a specific tool you want to see, tell us — we
          prioritise features based on real feedback.
        </p>
      </article>
    </SiteLayout>
  );
}
