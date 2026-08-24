import SiteLayout from "../components/SiteLayout";
import { SITE_NAME, LAUNCH_YEAR } from "../config";

export default function Disclaimer() {
  return (
    <SiteLayout
      title="Disclaimer"
      subtitle={`Please read this before using ${SITE_NAME}. Last updated: February ${LAUNCH_YEAR}.`}
    >
      <article className="doc" data-testid="disclaimer-content">
        <h2>General information only</h2>
        <p>
          The information and tools provided on {SITE_NAME} are for general informational and personal
          productivity purposes only. We make no representations or warranties of any kind, express or
          implied, about the completeness, accuracy, reliability, suitability or availability of the site or
          its content for any purpose. Any reliance you place on the service is therefore strictly at your
          own risk.
        </p>

        <h2>No professional advice</h2>
        <p>
          {SITE_NAME} is not a substitute for professional graphic design, legal, medical, financial or any
          other professional service. Content you produce using the editor should be reviewed by an
          appropriate professional before being used in decisions that could affect you or others.
        </p>

        <h2>Third-party content and links</h2>
        <p>
          The site may contain links to external websites or embed third-party services such as Google
          AdSense, hosting infrastructure and web fonts. We do not control the content, policies or
          availability of those third parties and are not responsible for any loss or damage caused by using
          them. Please review each provider’s terms and privacy policy before relying on it.
        </p>

        <h2>Advertising disclaimer</h2>
        <p>
          {SITE_NAME} displays third-party advertising to help fund the project. We do not endorse and are
          not responsible for the products, services or opinions of any advertiser or the accuracy of the
          information contained in any advertisement. Any transaction you enter into with an advertiser is
          solely between you and that advertiser.
        </p>

        <h2>Screenshots and other content</h2>
        <p>
          You are solely responsible for the images, screenshots or files that you edit using {SITE_NAME}.
          You must have the legal right to use, edit and share any content you process here. {SITE_NAME}
          does not review, approve or moderate the content you produce.
        </p>

        <h2>No warranty of availability</h2>
        <p>
          We do our best to keep {SITE_NAME} available and functioning correctly, but the service is offered
          without any guarantee of uptime, correctness or fitness for a particular purpose. Features may
          change, be added or be removed at any time without prior notice.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          To the fullest extent permitted by applicable law, in no event shall {SITE_NAME} or its
          contributors be liable for any indirect, incidental, consequential or punitive damages arising
          out of your access to or use of the site, or any content produced with it.
        </p>

        <h2>Consent</h2>
        <p>
          By using this website you consent to this Disclaimer and agree to its terms. If you do not agree,
          please stop using the service. Please also review our{" "}
          <a href="/privacy" data-testid="disclaimer-privacy-link">Privacy Policy</a> and{" "}
          <a href="/terms" data-testid="disclaimer-terms-link">Terms & Conditions</a>.
        </p>
      </article>
    </SiteLayout>
  );
}
