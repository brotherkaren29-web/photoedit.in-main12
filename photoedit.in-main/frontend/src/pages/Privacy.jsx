import SiteLayout from "../components/SiteLayout";
import { SITE_NAME, CONTACT_EMAIL, SITE_URL, LAUNCH_YEAR } from "../config";

export default function Privacy() {
  return (
    <SiteLayout
      title="Privacy Policy"
      subtitle={`How ${SITE_NAME} handles your data. Last updated: February ${LAUNCH_YEAR}.`}
    >
      <article className="doc" data-testid="privacy-content">
        <p>
          This Privacy Policy explains what information {SITE_NAME} (“we”, “our”, “the service”) collects when
          you use the website at {SITE_URL}, how that information is used and what your choices are.
          By using the site you agree to the practices described below.
        </p>

        <h2>1. Images and files you edit</h2>
        <p>
          The editor runs entirely inside your browser. Images you open, paste or capture are processed
          locally in the browser tab using the HTMLCanvasElement API and never leave your device through
          servers we own. We do not upload, copy, or store your images on any {SITE_NAME} server.
        </p>

        <h2>2. Information collected automatically</h2>
        <p>
          Like most websites, our hosting provider records basic technical information such as your IP
          address, browser user agent, referrer URL, requested pages and timestamps. This information is used
          to keep the site secure and available, and is retained only for a short period.
        </p>

        <h2>3. Cookies and local storage</h2>
        <p>
          We may use browser cookies and local storage to remember lightweight preferences such as your
          selected tool, brush color, zoom level or theme. We do not use cookies to build advertising
          profiles ourselves. Third-party services described below may set their own cookies according to
          their own policies.
        </p>

        <h2>4. Google AdSense and advertising</h2>
        <p>
          {SITE_NAME} displays advertisements delivered by Google AdSense. Google and its partners may use
          cookies and similar technologies to serve ads based on your prior visits to this or other websites.
          Google’s use of advertising cookies enables it and its partners to serve ads to you based on your
          visit to our site and other sites on the Internet.
        </p>
        <p>
          You can opt out of personalised advertising by visiting{" "}
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noreferrer">Google Ads Settings</a>{" "}
          or by visiting{" "}
          <a href="https://www.aboutads.info/" target="_blank" rel="noreferrer">www.aboutads.info</a>. For more
          information on how Google uses information from sites and apps that use its services, please review{" "}
          <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noreferrer">
            Google’s partner sites policy
          </a>.
        </p>

        <h2>5. Analytics (PostHog)</h2>
        <p>
          {SITE_NAME} uses <a href="https://posthog.com" target="_blank" rel="noreferrer">PostHog</a> for
          privacy-conscious product analytics. PostHog helps us understand which pages are visited,
          which tools are used and how the editor performs across browsers. Data collected includes
          anonymised event names, page paths, viewport size, timing metrics and a random session id.
        </p>
        <p>
          We do not send the images you edit, the text you type into text layers, or any content of
          your drafts to PostHog. Session recordings, if enabled, capture the page as HTML but our
          configuration excludes performance metrics and honours user opt-out signals. You can opt
          out of analytics collection in your browser using the &ldquo;Do Not Track&rdquo; signal
          or a browser extension such as uBlock Origin.
        </p>

        <h2>6. Children’s privacy</h2>
        <p>
          {SITE_NAME} is a general-audience tool and is not directed at children under the age of 13.
          We do not knowingly collect personal information from children under 13. If you believe a child
          has provided us with personal information, please contact us and we will remove it.
        </p>

        <h2>7. Your rights</h2>
        <p>
          Depending on where you live, you may have rights under laws such as the GDPR and the CCPA — for
          example, the right to access, correct or delete personal data we may hold about you. Because we do
          not run user accounts and do not receive your image files, the amount of personal data we hold is
          intentionally minimal. To exercise a right or ask a question, email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} data-testid="privacy-contact-email">{CONTACT_EMAIL}</a>.
        </p>

        <h2>8. Third-party links</h2>
        <p>
          The site may link to third-party websites (documentation, source code, partner services). We are not
          responsible for the content or privacy practices of those websites. Please review their policies
          before providing any personal information.
        </p>

        <h2>9. Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time to reflect new features, legal requirements or
          feedback from users. Material changes will be indicated by updating the “Last updated” date at the
          top of this page. Continued use of {SITE_NAME} after changes means you accept the revised policy.
        </p>

        <h2>10. Contact</h2>
        <p>
          For any privacy-related question please email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We aim to reply within a few working days.
        </p>
      </article>
    </SiteLayout>
  );
}
