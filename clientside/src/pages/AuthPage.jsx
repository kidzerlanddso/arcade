import { useState } from "react";

import Register from "../components/Register";
import Login from "../components/Login";
import logo from "../assets/logo.png"; 

function AuthPage() {
  const [showRegister, setShowRegister] = useState(false);
  const [googleSignup, setGoogleSignup] = useState(null);

  const handleGoogleNeedsRegistration = (payload) => {
    setGoogleSignup(payload);
    setShowRegister(true);
  };

  const handleCloseRegister = () => {
    setShowRegister(false);
    setGoogleSignup(null);
  };

  return (
    <main className="auth-shell">
      <section className="auth-hero">
        <div className="brand-panel">
          <div>
            <img src={logo} alt="AlumniConnect Logo" />
          </div>
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

          <Login onGoogleNeedsRegistration={handleGoogleNeedsRegistration} />
        </div>
      </section>

      {showRegister && (
        <Register
          isOpen={showRegister}
          onClose={handleCloseRegister}
          googleSignup={googleSignup}
          onGoogleNeedsRegistration={handleGoogleNeedsRegistration}
        />
      )}
    </main>
  );
}

export default AuthPage;
