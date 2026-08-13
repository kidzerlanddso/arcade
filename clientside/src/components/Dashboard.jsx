import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <div className="book-list">
      <div className="page-header">
        <h1></h1>
      </div>

      <nav className="action-row">
        <Link className="btn btn-primary" to="/profile">
          View All Profiles
        </Link>
        <Link className="btn btn-primary" to="/membership-request">
          Membership Request
        </Link>
        
      </nav>
    </div>
  );
}

export default Dashboard;