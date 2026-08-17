import "./Navbar.css";

function Navbar({ profile, currentPage, onNavigate, onLogout }) {
  return (
    <header className="navbar">
      <div className="logo">🌙 SUARA HATI</div>

      <div className="nav-buttons">
        <button
          className={`login-button ${currentPage === "community" ? "active" : ""}`}
          onClick={() => onNavigate("community")}
        >
          💭 Community
        </button>

        <button
          className={`login-button ${currentPage === "letters" ? "active" : ""}`}
          onClick={() => onNavigate("letters")}
        >
          💌 My Letters
        </button>

        <span className="navbar-username">@{profile.username}</span>

        <button className="signup-button" onClick={onLogout}>
          Log Out
        </button>
      </div>
    </header>
  );
}

export default Navbar;