import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import "./App.css";
import Auth from "./Auth";
import Profile from "./Profile";
import Community from "./Community";
import Admin from "./Admin";
import Letters from "./Letters";

import { auth, db } from "./firebase";

function App() {
const [user, setUser] = useState(null);
const [profile, setProfile] = useState(null);
const [isAdmin, setIsAdmin] = useState(false);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [currentPage, setCurrentPage] = useState("community");

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

  if (isAdmin) {
  return (
    <div className="app">

      <header className="navbar">

       <div className="logo">
         🌙 SUARA HATI
       </div>


       <div className="nav-buttons">

        <button
          className="login-button"
          onClick={() =>
            setCurrentPage("community")
          }
      >
         💭 Community
        </button>


        <button
          className="login-button"
          onClick={() =>
            setCurrentPage("letters")
          }
      >
          💌 My Letters
        </button>


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

      <Admin />

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

        <button
          className="login-button"
          onClick={() => setCurrentPage("community")}
        >
          💭 Community
        </button>

        <button
          className="login-button"
          onClick={() => setCurrentPage("letters")}
        >
          💌 My Letters
        </button>

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


    <footer>
      <p>
        Suara Hati • A place to be heard.
      </p>
    </footer>

  </div>
);
}

export default App;