import AppRoutes from "./routes/AppRoutes";

import "./css/style.scss";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <>
      <div className="site-topbar">
        <div className="site-topbar-inner">
          <div className="site-topbar-left">
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
            >
              <i className="fa-brands fa-facebook-f"></i>
            </a>
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              <i className="fa-brands fa-instagram"></i>
            </a>
          </div>

          <div className="site-topbar-right">
            <span>56 Kimbrae Drive, Hamilton 3281</span>
            <a href="tel:078540541">(07) 854 0541</a>
          </div>
        </div>
      </div>

      <AppRoutes />
    </>
  );
}

export default App;
