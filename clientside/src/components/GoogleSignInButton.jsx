import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";

import api, { setAccessToken } from "../api/axios";
import { useGoogleAuth } from "../context/GoogleAuthContext.jsx";

function GoogleSignInButton({ onNeedsRegistration, onLoginSuccess, context = "signin" }) {
  const { ready, enabled } = useGoogleAuth();
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!ready || !enabled) {
    return null;
  }

  const handleSuccess = async (credentialResponse) => {
    const credential = credentialResponse?.credential;
    if (!credential) {
      setStatus({ type: "error", message: "Google sign-in was cancelled." });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await api.post("/auth/google", { credential });

      if (response.data?.needsRegistration) {
        onNeedsRegistration?.(response.data);
        return;
      }

      const token = response.data.token;
      const isAdmin = Number(response.data.admin) === 1;

      localStorage.setItem("token", token);
      setAccessToken(token);
      localStorage.setItem("isAdmin", String(isAdmin));

      onLoginSuccess?.(response.data);
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error.response?.data?.message ||
          "Google sign-in failed. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="google-auth-block">
      {status.message && (
        <div className={`form-status form-status--${status.type}`}>
          {status.message}
        </div>
      )}

      <div className={isSubmitting ? "google-auth-block--busy" : ""}>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() =>
            setStatus({
              type: "error",
              message: "Google sign-in failed. Please try again.",
            })
          }
          text={context === "signup" ? "signup_with" : "continue_with"}
          shape="rectangular"
          width="320"
          locale="en"
        />
      </div>
    </div>
  );
}

export default GoogleSignInButton;
