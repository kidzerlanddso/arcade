import { useState } from "react";

import Register from "../components/Register";
import Login from "../components/Login";

function AuthPage() {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <main className="auth-shell">
      <section className="auth-hero">
        <div className="brand-panel">
          <div className="brand-badge">R</div>
          <h1>AlumniConnect</h1>
          <p>
            Discover, manage, and grow your community of Alumni in one place.
          </p>
        </div>

        <div className="auth-card">
          <div className="auth-switcher" aria-label="Authentication toggle">
            <button type="button" className="auth-tab active">
              Sign In
            </button>
            <button
              type="button"
              className="auth-tab"
              onClick={() => setShowRegister(true)}
            >
              Sign Up
            </button>
          </div>

          <Login />
        </div>
      </section>

      {showRegister && (
        <Register isOpen={showRegister} onClose={() => setShowRegister(false)} />
      )}
    </main>
  );
}

export default AuthPage;
