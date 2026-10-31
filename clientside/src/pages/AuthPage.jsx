import { useState } from "react";
import Login from "../components/Login";

function AuthPage() {
  const [message, setMessage] = useState("");

  return (
    <main className="auth-shell">
      <section className="auth-hero">
        <div className="brand-panel">
          <h1>Arcade Accounts</h1>
          <p>Manage arcade customers, contacts, fees, and payments.</p>
        </div>
        <div className="auth-card">
          <h2>Sign in</h2>
          <p>Use your staff account to continue.</p>
          {message && <p className="form-status form-status--error" role="alert">{message}</p>}
          <Login onGoogleNeedsRegistration={() => setMessage("This Google account is not enabled. Ask an administrator to set up your staff account.")} />
        </div>
      </section>
    </main>
  );
}

export default AuthPage;
