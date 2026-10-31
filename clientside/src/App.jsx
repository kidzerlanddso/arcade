import AppRoutes from "./routes/AppRoutes";
import ScrollToTop from "./components/ScrollToTop";
import "./css/style.scss";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <div className="app-shell">
      <ScrollToTop />
      <div className="app-shell-main">
        <AppRoutes />
      </div>
    </div>
  );
}

export default App;
