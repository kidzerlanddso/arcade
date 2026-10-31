import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import editIcon from '../assets/edit.png';
import deleteIcon from '../assets/bin.png';

const getAdminFromToken = () => {
  const currentToken = localStorage.getItem("token");

  if (!currentToken) return false;

  try {
    const payload = JSON.parse(atob(currentToken.split(".")[1] || ""));
    const adminValue = payload.admin;
    if (adminValue !== undefined && adminValue !== null) {
      return (
        adminValue === true ||
        adminValue === 1 ||
        adminValue === "1" ||
        adminValue === "true"
      );
    }
  } catch (error) {
    console.error("Error decoding token for admin status:", error);
  }

  const storedAdmin = localStorage.getItem("isAdmin");
  return storedAdmin === "true" || storedAdmin === "1";
};

function DynamicDataList() {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpertise, setShowAddExpertise] = useState(false);
  const [expertiseToEdit, setExpertiseToEdit] = useState(null);

  const token = localStorage.getItem("token");
  const isAdmin = getAdminFromToken();

  const handleDeleteExpertise = async (expertiseName) => {
    if (!expertiseName) return;

    const confirmed = window.confirm(
      `Delete the expertise "${expertiseName}" from all profiles?`,
    );
    if (!confirmed) return;

    try {
      await api.delete(
        `/data/dynamicdata/${encodeURIComponent(expertiseName)}`,
      );
      setAdmins((current) =>
        current.filter(
          (item) => (item.expertise || item.name) !== expertiseName,
        ),
      );
    } catch (error) {
      console.error("Error deleting expertise:", error);
      alert(
        error.response?.data?.message || "Unable to delete selected expertise.",
      );
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      navigate("/login", { replace: true });
      return;
    }

    api
      .get("/data/dynamicdata", { signal: controller.signal })
      .then((response) => {
        const dynamicdata = response.data.data || response.data;
        setAdmins(Array.isArray(dynamicdata) ? dynamicdata : []);
      })
      .catch((error) => {
        if (error.code !== "ERR_CANCELED") {
          console.error("Error fetching dynamic data:", error);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [navigate]);

  if (!token) return null;

  return (
    <div className="half-screen">
      <div className="page-header">
        <h2>List of Expertise</h2>
        <div className="action-row">
          {isAdmin && (
            <button
              type="button"
              className="auth-tab btn btn-success"
              onClick={() => setShowAddExpertise(true)}
            >
              + Add an Expertise
            </button>
          )}
        </div>
      </div>

      {showAddExpertise && (
        <AddExpertise
          isOpen={showAddExpertise}
          onClose={() => setShowAddExpertise(false)}
        />
      )}

      {expertiseToEdit && (
        <EditExpertise
          expertise={expertiseToEdit}
          isOpen={Boolean(expertiseToEdit)}
          onClose={() => setExpertiseToEdit(null)}
          onSaved={(updatedExpertise) => {
            setAdmins((current) =>
              current.map((item) =>
                item.expertise_id === expertiseToEdit.expertise_id
                  ? { ...item, ...updatedExpertise }
                  : item,
              ),
            );
          }}
        />
      )}

      {loading ? (
        <p>Loading dynamic data...</p>
      ) : (
        <div className="profile-list-view">
          {admins.length === 0 ? (
            <p>No expertise entries found.</p>
          ) : (
            admins.map((skill) => (
              <article
                className="profile-card"
                key={
                  skill.expertise_id ??
                  skill.id ??
                  skill.expertise ??
                  skill.name
                }
              >
                <div className="profile-card-body">
                  <p>
                    <strong></strong> {skill.expertise || skill.name || "-"}
                  </p>
                  <p style={{ marginLeft: "auto" }}>
                    <button
                      className="btn btn-light"
                      type="button"
                      onClick={() => setExpertiseToEdit(skill)}
                    >
                      <img
                        src={editIcon}
                        alt="Edit"
                        style={{ width: "16px", height: "16px" }}
                      />
                    </button>{" "}
                    <button
                      className="btn btn-danger"
                      type="button"
                      onClick={() =>
                        handleDeleteExpertise(skill.expertise_id || skill.id)
                      }
                    >
                      <img
                        src={deleteIcon}
                        alt="Delete"
                        style={{ width: "16px", height: "16px" }}
                      />
                    </button>
                  </p>
                </div>
              </article>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default DynamicDataList;
