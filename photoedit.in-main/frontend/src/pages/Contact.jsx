import { useState } from "react";
import SiteLayout from "../components/SiteLayout";
import { CONTACT_EMAIL, SUPPORT_EMAIL, SITE_NAME } from "../config";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "General question", message: "" });

  const submit = (e) => {
    e.preventDefault();
    // No backend for contact form yet — open the user's mail client with a prefilled draft.
    const body = `Name: ${form.name}%0D%0AFrom: ${form.email}%0D%0A%0D%0A${form.message}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(form.subject)}&body=${body}`;
    setSent(true);
  };

  return (
    <SiteLayout
      title="Contact us"
      subtitle="Feedback, feature requests, bug reports — we read everything."
    >
      <article className="doc" data-testid="contact-content">
        <div className="contact-grid">
          <div>
            <h2>Get in touch</h2>
            <p>
              The fastest way to reach {SITE_NAME} is by email. For general questions and feedback about the
              editor, please write to <a href={`mailto:${CONTACT_EMAIL}`} data-testid="contact-general-email">{CONTACT_EMAIL}</a>.
            </p>
            <p>
              For technical issues (a broken export, a rendering bug, a browser that misbehaves), use{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} data-testid="contact-support-email">{SUPPORT_EMAIL}</a>. Please include the
              browser and operating system you are using so we can reproduce the problem.
            </p>
            <p>
              For privacy or copyright requests, please read our{" "}
              <a href="/privacy" data-testid="contact-privacy-link">Privacy Policy</a> and{" "}
              <a href="/terms" data-testid="contact-terms-link">Terms & Conditions</a>, then contact us with the details.
            </p>
            <p>
              We are a small team, so replies may take a few working days — but every message is read.
            </p>
          </div>

          <form className="contact-form" onSubmit={submit} data-testid="contact-form">
            <label>
              <span>Your name</span>
              <input required data-testid="contact-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label>
              <span>Email</span>
              <input required type="email" data-testid="contact-email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </label>
            <label>
              <span>Subject</span>
              <select data-testid="contact-subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                <option>General question</option>
                <option>Bug report</option>
                <option>Feature request</option>
                <option>Privacy request</option>
                <option>Advertising</option>
              </select>
            </label>
            <label>
              <span>Message</span>
              <textarea required rows={5} data-testid="contact-message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </label>
            <button type="submit" className="btn-primary" data-testid="contact-submit">
              {sent ? "Open in mail client again" : "Send via email"}
            </button>
            {sent && (
              <p className="contact-hint" data-testid="contact-hint">
                We opened your default mail client with a pre-filled draft — send it from there and we will reply as soon as we can.
              </p>
            )}
          </form>
        </div>
      </article>
    </SiteLayout>
  );
}
