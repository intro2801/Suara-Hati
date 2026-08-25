import { useEffect, useState } from "react";

import {
  collection,
  onSnapshot,
  query,
  where
} from "firebase/firestore";

import { db } from "../src/firebase";

function Warnings({ user }) {
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    const warningsQuery = query(
      collection(db, "moderationLogs"),
      where("userId", "==", user.uid),
    );

    const unsubscribe = onSnapshot(
      warningsQuery,

      (snapshot) => {
        const allLogs = snapshot.docs
          .map((document) => ({
            id: document.id,
            ...document.data()
          }))
          .sort((a, b) => {
        const aTime =
          a.createdAt?.toMillis?.() || 0;

        const bTime =
          b.createdAt?.toMillis?.() || 0;

        return aTime - bTime;
      });

    let activeWarnings = [];

    allLogs.forEach((log) => {
      if (log.action === "warning_reset") {
         activeWarnings = [];
      }

      if (log.action === "warning") {
         activeWarnings.push(log);
      }
    });

    const warningList = activeWarnings.reverse();

        setWarnings(warningList);
        setLoading(false);
      },

      (error) => {
        console.error(
          "WARNING LOAD ERROR:",
          error
        );

        setError(
          "We couldn't load your warnings."
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();

  }, [user]);


  const formatDate = (timestamp) => {
    if (!timestamp) {
      return "Just now";
    }

    if (timestamp.toDate) {
      return timestamp
        .toDate()
        .toLocaleString();
    }

    return "Unknown date";
  };


  return (
    <main className="warnings-page">

      <section className="warnings-header">

        <div className="warnings-icon">
          ⚠️
        </div>

        <h1>
          My Warnings
        </h1>

        <p>
          Review moderation warnings on your account.
        </p>

      </section>


      <div className="warning-count-card">

        <strong>
          {warnings.length}
        </strong>

        <span>
          Total Warnings
        </span>

      </div>


      {error && (
        <div className="auth-error">
          {error}
        </div>
      )}


      {loading && (
        <div className="empty-message">
          Loading your warnings...
        </div>
      )}


      {!loading &&
        warnings.length === 0 && (

        <div className="empty-message">

          <div className="empty-icon">
            ✅
          </div>

          <h3>
            No warnings
          </h3>

          <p>
            Your account currently has no warnings.
          </p>

        </div>
      )}


      <div className="warning-list">

        {warnings.map((warning) => (

          <article
            className="warning-card"
            key={warning.id}
          >

            <div className="warning-card-top">

              <strong>
                ⚠️ Warning
              </strong>

              <span>
                {formatDate(warning.createdAt)}
              </span>

            </div>


            <div className="warning-info">

              <strong>
                Reason
              </strong>

              <p>
                {warning.reason || "No reason provided"}
              </p>

            </div>


            {warning.note && (

              <div className="warning-info">

                <strong>
                  Moderator note
                </strong>

                <p>
                  {warning.note}
                </p>

              </div>

            )}

          </article>

        ))}

      </div>

    </main>
  );
}

export default Warnings;