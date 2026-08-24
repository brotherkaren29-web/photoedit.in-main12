import SiteLayout from "../components/SiteLayout";
import { SITE_NAME, CONTACT_EMAIL, SITE_URL, LAUNCH_YEAR } from "../config";

export default function Terms() {
  return (
    <SiteLayout
      title="Terms & Conditions"
      subtitle={`Rules for using ${SITE_NAME}. Last updated: February ${LAUNCH_YEAR}.`}
    >
      <article className="doc" data-testid="terms-content">
        <p>
          These Terms & Conditions (“Terms”) govern your use of {SITE_NAME} at {SITE_URL}. By accessing or
          using the site you agree to be bound by these Terms. If you do not agree, please stop using the
          service.
        </p>

        <h2>1. The service</h2>
        <p>
          {SITE_NAME} provides a free browser-based image and screenshot editor. It is offered “as is” and
          “as available”, without warranties of any kind. Availability, features and appearance may change
          without notice.
        </p>

        <h2>2. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the service to process content that is illegal in your jurisdiction.</li>
          <li>Attempt to disrupt or reverse engineer the service in a way that harms other users.</li>
          <li>Use the service to violate someone else’s intellectual property or privacy.</li>
          <li>Frame, scrape or embed the site in ways that misrepresent it as your own.</li>
          <li>Attempt to bypass or interfere with any advertising, security or usage limits.</li>
        </ul>

        <h2>3. Your content</h2>
        <p>
          You retain all rights to the images you edit. Because editing happens locally in your browser,
          {" "}{SITE_NAME} does not receive a copy of your files. You are responsible for making sure you have
          the right to edit and use any image you open in the editor.
        </p>

        <h2>4. Intellectual property</h2>
        <p>
          The {SITE_NAME} name, logo, source code, layout, copy and design are the property of {SITE_NAME} and
          its contributors, and are protected by applicable copyright and trademark laws. You may not copy or
          reuse them without written permission except for personal, non-commercial reference.
        </p>

        <h2>5. Third-party services</h2>
        <p>
          {SITE_NAME} embeds third-party services such as Google AdSense and web fonts. Your use of those
          services is subject to their own terms and privacy policies. We are not responsible for how third
          parties handle information they collect directly from your browser.
        </p>

        <h2>6. Disclaimer of warranties</h2>
        <p>
          The service is provided on an “as is” and “as available” basis, without warranty of any kind, whether
          express, implied or statutory, including but not limited to warranties of merchantability, fitness
          for a particular purpose, non-infringement or accuracy. We do not warrant that the service will be
          uninterrupted, error-free, secure or that any defect will be corrected.
        </p>

        <h2>7. Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, {SITE_NAME} and its contributors will not be liable for any
          indirect, incidental, consequential, special or punitive damages, or any loss of data, profits or
          goodwill, arising out of or in connection with your use of the service — even if we have been
          advised of the possibility of such damages. Your sole remedy is to stop using the service.
        </p>

        <h2>8. Indemnification</h2>
        <p>
          You agree to defend, indemnify and hold harmless {SITE_NAME} and its contributors from any claim,
          damage, liability, cost or expense arising out of your use of the service or your violation of
          these Terms.
        </p>

        <h2>9. Termination</h2>
        <p>
          We may suspend or terminate access to the service at any time, for any reason, without notice.
          Sections of these Terms that by their nature should survive termination will remain in effect.
        </p>

        <h2>10. Governing law</h2>
        <p>
          These Terms are governed by the laws of India, without regard to conflict-of-laws principles. Any
          dispute arising out of these Terms or your use of the service will be resolved in the competent
          courts of India, unless otherwise required by mandatory law.
        </p>

        <h2>11. Changes</h2>
        <p>
          We may update these Terms from time to time. Updated versions will be posted on this page with a
          new “Last updated” date. Continued use after changes constitutes acceptance of the revised Terms.
        </p>

        <h2>12. Contact</h2>
        <p>
          Questions about these Terms? Write to{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} data-testid="terms-contact-email">{CONTACT_EMAIL}</a>.
        </p>
      </article>
    </SiteLayout>
  );
}
