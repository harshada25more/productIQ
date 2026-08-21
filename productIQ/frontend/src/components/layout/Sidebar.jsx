import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ClipboardCheck,
  Activity,
  Sparkles,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Add Product",
      path: "/add-product",
      icon: PlusCircle,
    },
    {
      name: "Products",
      path: "/products",
      icon: Package,
    },
    {
      name: "Review Center",
      path: "/review-center",
      icon: ClipboardCheck,
    },
    {
      name: "Catalog Health",
      path: "/catalog-health",
      icon: Activity,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="logo-section">
        <div className="logo-icon">
          <Sparkles size={22} />
        </div>

        <div>
          <h2>ProductIQ</h2>
          <span>AI Commerce Intelligence</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-title">MAIN</p>

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <Icon size={19} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="ai-status">
          <div className="status-dot"></div>

          <div>
            <strong>AI Engine</strong>
            <span>Online (v1.0)</span>
          </div>
        </div>

        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;