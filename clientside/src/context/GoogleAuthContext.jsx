import { GoogleOAuthProvider } from "@react-oauth/google";
import axios from "axios";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { API_URL } from "../api/axios";

const GoogleAuthContext = createContext({
  ready: false,
  enabled: false,
  clientId: "",
});

export function useGoogleAuth() {
  return useContext(GoogleAuthContext);
}

export function GoogleAuthProvider({ children }) {
  const envClientId = String(import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();
  const [fetchedClientId, setFetchedClientId] = useState("");
  const [ready, setReady] = useState(Boolean(envClientId));

  useEffect(() => {
    if (envClientId) {
      return;
    }

    let cancelled = false;

    axios
      .get(`${API_URL}/auth/google/config`)
      .then((response) => {
        if (cancelled) {
          return;
        }
        const clientId = String(response.data?.clientId || "").trim();
        setFetchedClientId(clientId);
      })
      .catch(() => {
        if (!cancelled) {
          setFetchedClientId("");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [envClientId]);

  const clientId = envClientId || fetchedClientId;
  const value = useMemo(
    () => ({
      ready: envClientId ? true : ready,
      enabled: Boolean(clientId),
      clientId,
    }),
    [clientId, envClientId, ready],
  );

  if (!value.ready) {
    return (
      <GoogleAuthContext.Provider value={value}>
        {children}
      </GoogleAuthContext.Provider>
    );
  }

  if (!value.enabled) {
    return (
      <GoogleAuthContext.Provider value={value}>
        {children}
      </GoogleAuthContext.Provider>
    );
  }

  return (
    <GoogleAuthContext.Provider value={value}>
      <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>
    </GoogleAuthContext.Provider>
  );
}
