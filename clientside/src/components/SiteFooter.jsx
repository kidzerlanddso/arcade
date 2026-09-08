import logo from "../assets/logo_footer_white.png";

const RHS_BASE = "https://www.rhs.school.nz";

const SCHOOL_ADDRESS = "56 Kimbrae Drive, Rototuna North, Hamilton, NZ, 3281";
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SCHOOL_ADDRESS)}`;
const MAP_EMBED_URL =
  "https://maps.google.com/maps?q=56+Kimbrae+Drive,+Rototuna+North,+Hamilton,+New+Zealand&z=15&output=embed";

function SiteFooter() {
  return (
    <>
      <div className="site-footer-pattern" aria-hidden="true" />
      <footer className="site-footer">
        <div className="site-footer-inner">
          <div className="site-footer-col site-footer-brand">
            <a
              href={RHS_BASE}
              target="_blank"
              rel="noopener noreferrer"
              className="site-footer-logo"
              aria-label="Rototuna High Schools"
            >
              <img src={logo} alt="Rototuna High Schools" />
            </a>
          </div>

          <div className="site-footer-col site-footer-block">
            <h4>Contact Us</h4>
            <a href="tel:+6478540541">(07) 854 0541</a>
            <a href="mailto:communication@rhs.school.nz">
              communication@rhs.school.nz
            </a>
            <p>
              P.O. Box 21116,
              <br />
              Rototuna, Hamilton,
              <br />
              NZ, 3256
            </p>
          </div>

          <div className="site-footer-col site-footer-block site-footer-find-us">
            <h4>Find Us</h4>
            <div className="site-footer-find-us-row">
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="site-footer-address"
              >
                56 Kimbrae Drive,
                <br />
                Rototuna North,
                <br />
                Hamilton, NZ, 3281
              </a>

              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="site-footer-map"
                aria-label="Open school location in Google Maps"
              >
                <iframe
                  title="Rototuna High Schools map"
                  src={MAP_EMBED_URL}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </a>
            </div>
          </div>
        </div>

        <div className="site-footer-base">
          <div className="site-footer-base-inner">
            <div className="site-footer-base-left">
              <a
                href={`${RHS_BASE}/privacy`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Notice
              </a>
              <span>
                © Copyright {new Date().getFullYear()} by Rototuna High Schools
              </span>
            </div>
            <div className="site-footer-base-social">
              <a
                href="https://www.facebook.com/Rototuna-Junior-and-Senior-High-Schools-1724530917772865/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <i className="fa-brands fa-facebook-f" />
              </a>
              <a
                href="https://www.instagram.com/rototuna_high_schools/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <i className="fa-brands fa-instagram" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default SiteFooter;
