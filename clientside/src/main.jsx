import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App.jsx";
import { GoogleAuthProvider } from "./context/GoogleAuthContext.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <GoogleAuthProvider>
      <App />
    </GoogleAuthProvider>
  </BrowserRouter>,
);
