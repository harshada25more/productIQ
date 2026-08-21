import { useState } from "react";
import { Bell, Search, LogOut, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "A";

  return (
    <header className="topbar">
      <form className="search-box" onSubmit={handleSearchSubmit}>
        <Search size={18} />
        <input
          type="text"
          placeholder="Search products, SKUs, attributes, brands..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>

      <div className="topbar-actions">
        <button
          className="icon-button"
          title="Notifications"
          onClick={() => alert("All AI enrichment models are functioning normally.")}
        >
          <Bell size={20} />
        </button>

        <div className="user-profile-container">
          <div
            className="user-profile clickable"
            onClick={() => setShowMenu(!showMenu)}
          >
            <div className="avatar">{initials}</div>

            <div>
              <strong>{user?.name || "Catalog Admin"}</strong>
              <span>{user?.role || "Catalog Manager"}</span>
            </div>

            <ChevronDown size={14} className="chevron-icon" />
          </div>

          {showMenu && (
            <div className="user-dropdown-menu">
              <div className="dropdown-user-info">
                <strong>{user?.name}</strong>
                <p>{user?.email}</p>
                <span className="role-tag">{user?.role}</span>
              </div>
              <hr />
              <button className="dropdown-logout-btn" onClick={handleLogout}>
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;