import AppRoutes from "./routes/AppRoutes";
import SiteFooter from "./components/SiteFooter";

import "./css/style.scss";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <div className="app-shell">
      <div className="site-topbar">
        <div className="site-topbar-inner">
          <div className="site-topbar-left">
            <a
              href="https://www.facebook.com/Rototuna-Junior-and-Senior-High-Schools-1724530917772865/"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
            >
              <i className="fa-brands fa-facebook-f"></i>
            </a>
            <a
              href="https://www.instagram.com/rototuna_high_schools/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              <i className="fa-brands fa-instagram"></i>
            </a>
          </div>

          <div className="site-topbar-right">
            <a
              href="https://www.google.com/maps/search/?api=1&query=56%20Kimbrae%20Drive%2C%20Hamilton%203281"
              target="_blank"
              rel="noreferrer"
              className="site-topbar-address"
            >
              <i className="fa-solid fa-location-dot" aria-hidden="true"></i>
              <span>56 Kimbrae Drive, Hamilton 3281</span>
            </a>
            <a href="tel:+6478540541" className="site-topbar-phone">
              <i className="fa-solid fa-phone" aria-hidden="true"></i>
              <span>(07) 854 0541</span>
            </a>
          </div>
        </div>
      </div>

      <div className="app-shell-main">
        <AppRoutes />
      </div>

      <SiteFooter />
    </div>
  );
}

export default App;
