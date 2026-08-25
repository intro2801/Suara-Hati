import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where
} from "firebase/firestore";

import "./App.css";

import Auth from "../component/Auth";
import Profile from "../component/Profile";
import Community from "../component/Community";
import Letters from "../component/Letters";

import Admin from "./Admin";

import { auth, db } from "./firebase";

import Warnings from "../component/Warnings";

function App() {
const [user, setUser] = useState(null);
const [profile, setProfile] = useState(null);
const [isAdmin, setIsAdmin] = useState(false);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [currentPage, setCurrentPage] = useState("community");
const [isPageSwitching, setIsPageSwitching] = useState(false);
const [unreadLetterCount, setUnreadLetterCount] = useState(0);

const [theme, setTheme] = useState(() => {
  return localStorage.getItem("suaraHatiTheme") || "aurora";
});

const themeWelcomeMessages = {
  aurora: "A little light can still find you tonight. ✨",
  ocean: "Take things slowly. You do not need to rush. 🌊",
  lavender: "Stay awhile. This space is yours. 🌙",
  teal: "You can rest here for a moment. 🌿",
  midnight: "Even quiet nights eventually become morning. ⭐",
  celestial: "A softer moment is waiting for you. ☁️"
};

const [themeMenuOpen, setThemeMenuOpen] = useState(false);

useEffect(() => {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("suaraHatiTheme", theme);
}, [theme]);

const changePage = (page) => {
  if (page === currentPage || isPageSwitching) return;

  setIsPageSwitching(true);

  setTimeout(() => {
    setCurrentPage(page);

    setTimeout(() => {
      setIsPageSwitching(false);
    }, 50);
  }, 350);
};

useEffect(() => {
  if (isAdmin) {
    setCurrentPage("admin");
  }
}, [isAdmin]);

useEffect(() => {
  const unsubscribe = onAuthStateChanged(
    auth,
    async (currentUser) => {

      try {

        setUser(currentUser);
        setError("");
        setIsAdmin(false);

        if (!currentUser) {
          setProfile(null);
          return;
        }

        console.log(
          "Logged in user:",
          currentUser.uid
        );

        // =====================================
        // LOAD USER PROFILE
        // =====================================

        const profileRef = doc(
          db,
          "users",
          currentUser.uid
        );

        const profileSnapshot =
          await getDoc(profileRef);

        if (profileSnapshot.exists()) {

          setProfile(
            profileSnapshot.data()
          );

        } else {

          setProfile(null);

        }


        // =====================================
        // CHECK ADMIN
        // =====================================

        const adminRef = doc(
          db,
          "admins",
          currentUser.uid
        );

        const adminSnapshot =
          await getDoc(adminRef);

        if (
          adminSnapshot.exists() &&
          adminSnapshot.data().active === true
        ) {

          console.log(
            "ADMIN ACCESS GRANTED"
          );

          setIsAdmin(true);

        } else {

          console.log(
            "Normal user account"
          );

          setIsAdmin(false);

        }

      } catch (error) {

        console.error(
          "APP ERROR:",
          error
        );

        console.error(
          "ERROR CODE:",
          error.code
        );

        console.error(
          "ERROR MESSAGE:",
          error.message
        );

        setError(
          "We couldn't load your account."
        );

      } finally {

        setLoading(false);

      }

    }
  );

  return () => unsubscribe();

}, []);

useEffect(() => {
  if (!user) {
    setUnreadLetterCount(0);
    return;
  }

  const lettersQuery = query(
    collection(db, "letters"),
    where("receiverId", "==", user.uid),
    where("status", "==", "approved")
  );

  const unsubscribe = onSnapshot(
    lettersQuery,
    (snapshot) => {
      let readIds = [];

      try {
        readIds = JSON.parse(
          localStorage.getItem("suaraHatiReadLetters") || "[]"
        );
      } catch {
        readIds = [];
      }

      const unread = snapshot.docs.filter(
        (letterDoc) => !readIds.includes(letterDoc.id)
      ).length;

      setUnreadLetterCount(unread);
    }
  );

  return () => unsubscribe();
}, [user]);

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">🌙</div>

          <h1>Suara Hati</h1>

          <p className="auth-description">
            Loading your safe space...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  if (error) {
    return (
      <div className="auth-page">
        <div className="auth-card">

          <div className="auth-logo">
            ⚠️
          </div>

          <h1>Something went wrong</h1>

          <p className="auth-description">
            {error}
          </p>

          <button
            className="auth-submit"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>

          <button
            className="auth-submit"
            style={{
              marginTop: "10px",
              background: "#292e3b",
              color: "white"
            }}
            onClick={() => signOut(auth)}
          >
            Log Out
          </button>

        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <Profile
        user={user}
        onComplete={() => {
          window.location.reload();
        }}
      />
    );
  }

  // ==========================================
// ACCOUNT STATUS
// ==========================================

if (profile.status === "banned") {
  return (
    <div className="account-restricted-page">

      <div className="account-restricted-card">

        <div className="restricted-icon">
          🚫
        </div>

        <h1>Account Banned</h1>

        <p>
          Your Suara Hati account has been banned
          because of a violation of our community rules.
        </p>

        <button
          className="auth-submit"
          onClick={() => signOut(auth)}
        >
          Log Out
        </button>

      </div>

    </div>
  );
}


if (profile.status === "suspended") {
  return (
    <div className="account-restricted-page">

      <div className="account-restricted-card">

        <div className="restricted-icon">
          ⏸️
        </div>

        <h1>Account Suspended</h1>

        <p>
          Your account has been temporarily restricted
          by the Suara Hati moderation team.
        </p>

        <button
          className="auth-submit"
          onClick={() => signOut(auth)}
        >
          Log Out
        </button>

      </div>

    </div>
  );
}

  if (isAdmin) {
  return (
    <div className={`app ${isPageSwitching ? "page-switching" : ""}`}>

      <header className="navbar">

       <div className="logo">
         🌙 SUARA HATI
       </div>


       <div className="nav-buttons">

        <button
            className={`login-button ${
              currentPage === "admin" ? "nav-active" : ""
            }`}
            onClick={() => changePage("admin")}
      >
         🛡️ Admin
        </button>

        <button
          className={`login-button ${
            currentPage === "community" ? "nav-active" : ""
          }`}
          onClick={() =>
            changePage("community")
          }
      >
         💭 Community
        </button>


        <button
          className={`login-button ${
            currentPage === "letters" ? "nav-active" : ""
          } ${
            unreadLetterCount > 0 ? "nav-has-notifications" : ""
          }`}
          onClick={() =>
            changePage("letters")
          }
      >
          💌 My Letters

          {unreadLetterCount > 0 && (
             <span className="nav-notification-badge">
              {unreadLetterCount}
             </span>
        )}
        </button>

        <div className="theme-picker">

  <button
    type="button"
    className="theme-picker-button"
    onClick={() => setThemeMenuOpen((open) => !open)}
  >
    🎨 Theme
    <span className="theme-picker-arrow">
      ▾
    </span>
  </button>

  {themeMenuOpen && (
    <div className="theme-picker-menu">

      <button
        type="button"
        className={theme === "aurora" ? "selected-theme" : ""}
        onClick={() => {
          setTheme("aurora");
          setThemeMenuOpen(false);
        }}
      >
        <span className="theme-dot aurora-dot" />
        <span>
          <strong>Aurora Blue</strong>
          <small>Dreamy & magical</small>
        </span>
      </button>

      <button
        type="button"
        className={theme === "ocean" ? "selected-theme" : ""}
        onClick={() => {
          setTheme("ocean");
          setThemeMenuOpen(false);
        }}
      >
        <span className="theme-dot ocean-dot" />
        <span>
          <strong>Ocean Depth</strong>
          <small>Deep & peaceful</small>
        </span>
      </button>

      <button
        type="button"
        className={theme === "lavender" ? "selected-theme" : ""}
        onClick={() => {
          setTheme("lavender");
          setThemeMenuOpen(false);
        }}
      >
        <span className="theme-dot lavender-dot" />
        <span>
          <strong>Lavender Night</strong>
          <small>Soft & cozy</small>
        </span>
      </button>

      <button
        type="button"
        className={theme === "teal" ? "selected-theme" : ""}
        onClick={() => {
          setTheme("teal");
          setThemeMenuOpen(false);
        }}
      >
        <span className="theme-dot teal-dot" />
        <span>
          <strong>Teal Mist</strong>
          <small>Natural & calming</small>
        </span>
      </button>

      <button
        type="button"
        className={theme === "midnight" ? "selected-theme" : ""}
        onClick={() => {
          setTheme("midnight");
          setThemeMenuOpen(false);
        }}
      >
        <span className="theme-dot midnight-dot" />
        <span>
          <strong>Midnight Sky</strong>
          <small>Quiet & starry</small>
        </span>
      </button>

      <button
        type="button"
        className={theme === "celestial" ? "selected-theme" : ""}
        onClick={() => {
          setTheme("celestial");
          setThemeMenuOpen(false);
        }}
      >
        <span className="theme-dot celestial-dot" />
        <span>
          <strong>Celestial Dream</strong>
          <small>Light & dreamy</small>
        </span>
      </button>

    </div>
  )}

</div>

        <span style={{ color: "#a8adbd" }}>
           @{profile.username}
        </span>


        <button
           className="signup-button"
           onClick={() => signOut(auth)}
      >
        Log Out
      </button>

      </div>

      </header>

      {currentPage === "community" && (
       <Community
           user={user}
           profile={profile}
           themeMessage={themeWelcomeMessages[theme]}
      />
    )}

      {currentPage === "letters" && (
       <Letters
          user={user}
          profile={profile}
          onLetterRead={() => {
            setUnreadLetterCount((count) => Math.max(0, count - 1));
          }}
      />
    )}

      {currentPage === "admin" && (
      <Admin />
    )}

    </div>
  );
}

return (
  <div className="app">

    <header className="navbar">

      <div className="logo">
        🌙 SUARA HATI
      </div>

      <div className="nav-buttons">

        {isAdmin && (
        <button
          className="login-button"
          onClick={() => changePage("admin")}
        >
          🛡️ Admin
        </button>
      )}

        <button
          className="login-button"
          onClick={() => changePage("community")}
        >
          💭 Community
        </button>

        <button
          className="login-button"
          onClick={() => changePage("letters")}
        >
          💌 My Letters
        </button>

        <button
          className="login-button"
          onClick={() =>
             changePage("warnings")
          }
       >
         ⚠️ My Warnings
        </button>

        <div className="theme-picker">

  <button
    type="button"
    className="theme-picker-button"
    onClick={() => setThemeMenuOpen((open) => !open)}
  >
    🎨 Theme
    <span className="theme-picker-arrow">▾</span>
  </button>

  {themeMenuOpen && (
    <div className="theme-picker-menu">

      <button
        type="button"
        className={theme === "aurora" ? "selected-theme" : ""}
        onClick={() => {
          setTheme("aurora");
          setThemeMenuOpen(false);
        }}
      >
        <span className="theme-dot aurora-dot" />

        <span>
          <strong>Aurora Blue</strong>
          <small>Dreamy & magical</small>
        </span>
      </button>


      <button
        type="button"
        className={theme === "ocean" ? "selected-theme" : ""}
        onClick={() => {
          setTheme("ocean");
          setThemeMenuOpen(false);
        }}
      >
        <span className="theme-dot ocean-dot" />

        <span>
          <strong>Ocean Depth</strong>
          <small>Deep & peaceful</small>
        </span>
      </button>


      <button
        type="button"
        className={theme === "lavender" ? "selected-theme" : ""}
        onClick={() => {
          setTheme("lavender");
          setThemeMenuOpen(false);
        }}
      >
        <span className="theme-dot lavender-dot" />

        <span>
          <strong>Lavender Night</strong>
          <small>Soft & cozy</small>
        </span>
      </button>


      <button
        type="button"
        className={theme === "teal" ? "selected-theme" : ""}
        onClick={() => {
          setTheme("teal");
          setThemeMenuOpen(false);
        }}
      >
        <span className="theme-dot teal-dot" />

        <span>
          <strong>Teal Mist</strong>
          <small>Natural & calming</small>
        </span>
      </button>


      <button
        type="button"
        className={theme === "midnight" ? "selected-theme" : ""}
        onClick={() => {
          setTheme("midnight");
          setThemeMenuOpen(false);
        }}
      >
        <span className="theme-dot midnight-dot" />

        <span>
          <strong>Midnight Sky</strong>
          <small>Quiet & starry</small>
        </span>
      </button>


      <button
        type="button"
        className={theme === "celestial" ? "selected-theme" : ""}
        onClick={() => {
          setTheme("celestial");
          setThemeMenuOpen(false);
        }}
      >
        <span className="theme-dot celestial-dot" />

        <span>
          <strong>Celestial Dream</strong>
          <small>Light & dreamy</small>
        </span>
      </button>

    </div>
  )}

</div>

        <span style={{ color: "#a8adbd" }}>
          @{profile.username}
        </span>

        <button
          className="signup-button"
          onClick={() => signOut(auth)}
        >
          Log Out
        </button>

      </div>

    </header>


    {currentPage === "community" && (
      <Community
        user={user}
        profile={profile}
      />
    )}


    {currentPage === "letters" && (
      <Letters
        user={user}
        profile={profile}
      />
    )}


    {currentPage === "warnings" && (
      <Warnings
         user={user}
      />
    )}

    <footer>
      <p>
        Suara Hati • A place to be heard.
      </p>
    </footer>

  </div>
);
}

export default App;