import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "../src/firebase";

function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      } else {
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
      }
    } catch (error) {
  console.error("FIREBASE ERROR:", error);
  console.error("ERROR CODE:", error.code);
  console.error("ERROR MESSAGE:", error.message);

  if (error.code === "auth/email-already-in-use") {
    setError("This email is already registered.");
  } else if (error.code === "auth/invalid-email") {
    setError("Please enter a valid email.");
  } else if (error.code === "auth/weak-password") {
    setError("Password must be at least 6 characters.");
  } else if (error.code === "auth/operation-not-allowed") {
    setError("Email/password login is not enabled in Firebase.");
  } else if (error.code === "auth/network-request-failed") {
    setError("Network connection failed. Please check your internet.");
  } else {
    setError(`Firebase error: ${error.code}`);
  }
}

    setLoading(false);
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">
          🌙
        </div>

        <h1>
          {isLogin ? "Welcome back" : "Create your account"}
        </h1>

        <p className="auth-description">
          {isLogin
            ? "Come back to your safe space."
            : "Create your own safe space at Suara Hati."}
        </p>

        <form onSubmit={handleSubmit}>

          <label>Email</label>

          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

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
            {loading
              ? "Please wait..."
              : isLogin
              ? "Log In"
              : "Create Account"}
          </button>

        </form>

        <div className="auth-switch">

          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
          >
            {isLogin ? "Create Account" : "Log In"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default Auth;