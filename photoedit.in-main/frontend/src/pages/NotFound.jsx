import { Link } from "react-router-dom";
import SiteLayout from "../components/SiteLayout";

export default function NotFound() {
  return (
    <SiteLayout title="404 — Page not found" subtitle="This page took a wrong turn.">
      <div className="doc" data-testid="notfound-content">
        <p>The page you are looking for does not exist or has been moved.</p>
        <p><Link to="/" className="btn-primary" data-testid="notfound-home">Go back home</Link></p>
      </div>
    </SiteLayout>
  );
}
