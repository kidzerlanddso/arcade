import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <div className="book-list">
      <div className="page-header">
        <h1></h1>
      </div>

      <nav className="action-row">
        
        <Link className="btn btn-primary" to="/add-event">
          Add Event 
        </Link>
        
      </nav>
    </div>
  );
}

export default Dashboard;