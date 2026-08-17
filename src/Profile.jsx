import { useState } from "react";
import { auth, db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";

function Profile({ user, onComplete }) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateProfile = async (event) => {
    event.preventDefault();

    const cleanUsername = username.trim();

    if (cleanUsername.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }

    if (cleanUsername.length > 20) {
      setError("Username must be 20 characters or less.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await setDoc(doc(db, "users", user.uid), {
        username: cleanUsername,
        email: user.email,
        role: "user",
        status: "active",
        createdAt: new Date()
      });

      onComplete();
    } catch (error) {
      console.error(error);
      setError("We couldn't create your profile. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">
          🌙
        </div>

        <h1>Welcome to Suara Hati</h1>

        <p className="auth-description">
          Before you enter, choose a username.
        </p>

        <form onSubmit={handleCreateProfile}>

          <label>Username</label>

          <input
            type="text"
            placeholder="Choose your username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            minLength="3"
            maxLength="20"
            required
          />

          <p
            style={{
              color: "#777f91",
              fontSize: "13px",
              marginBottom: "18px"
            }}
          >
            This is the name people will see when you choose to
            show your identity.
          </p>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating profile..." : "Continue"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default Profile;