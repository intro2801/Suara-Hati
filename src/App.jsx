import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import "./styles/tokens.css";
import "./components/Auth.css";

import Auth from "./components/Auth";
import Profile from "./components/Profile";
import Navbar from "./components/Navbar";
import Community from "./components/Community";
import Admin from "./components/Admin";
import Letters from "./components/Letters";
import CareNotification from "./components/CareNotification";

import { auth, db } from "./firebase";

function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState("community");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        setUser(currentUser);
        setError("");
        setIsAdmin(false);

        if (!currentUser) {
          setProfile(null);
          return;
        }

        const profileRef = doc(db, "users", currentUser.uid);
        const profileSnapshot = await getDoc(profileRef);
        setProfile(profileSnapshot.exists() ? profileSnapshot.data() : null);

        const adminRef = doc(db, "admins", currentUser.uid);
        const adminSnapshot = await getDoc(adminRef);
        setIsAdmin(adminSnapshot.exists() && adminSnapshot.data().active === true);
      } catch (err) {
        console.error("APP INIT ERROR:", err.code, err.message);
        setError("We couldn't load your account. Please try again.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => signOut(auth);

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">🌙</div>
          <h1>Suara Hati</h1>
          <p className="auth-description">Loading your safe space...</p>
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
          <div className="auth-logo">⚠️</div>
          <h1>Something went wrong</h1>
          <p className="auth-description">{error}</p>

          <button className="auth-submit" onClick={() => window.location.reload()}>
            Try Again
          </button>

          <button className="auth-submit auth-submit-secondary" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <Profile user={user} onComplete={() => window.location.reload()} />;
  }

  return (
    <div className="app">
      <Navbar
        profile={profile}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
      />

      <CareNotification user={user} onView={() => setCurrentPage("letters")} />

      {isAdmin ? (
        <Admin />
      ) : (
        <>
          {currentPage === "community" && <Community user={user} profile={profile} />}
          {currentPage === "letters" && <Letters user={user} profile={profile} />}
        </>
      )}

      <footer>
        <p>Suara Hati • A place to be heard.</p>
      </footer>
    </div>
  );
}

export default App;