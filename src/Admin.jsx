import { useEffect, useState } from "react";

import {
  collection,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  doc,
  deleteDoc
} from "firebase/firestore";

import { db } from "./firebase";

function Admin() {
  const [posts, setPosts] = useState([]);
  const [reports, setReports] = useState([]);

  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);

  const [error, setError] = useState("");

  // ==========================================
  // LOAD POSTS
  // ==========================================

  useEffect(() => {
    const postsQuery = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      postsQuery,

      (snapshot) => {
        const postList = snapshot.docs.map((post) => ({
          id: post.id,
          ...post.data()
        }));

        setPosts(postList);
        setLoadingPosts(false);
      },

      (error) => {
        console.error("ADMIN POSTS ERROR:", error);

        setError(
          "We couldn't load the moderation posts."
        );

        setLoadingPosts(false);
      }
    );

    return () => unsubscribe();
  }, []);


  // ==========================================
  // LOAD REPORTS
  // ==========================================

  useEffect(() => {
    const reportsQuery = query(
      collection(db, "reports"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      reportsQuery,

      (snapshot) => {
        const reportList = snapshot.docs.map((report) => ({
          id: report.id,
          ...report.data()
        }));

        setReports(reportList);
        setLoadingReports(false);
      },

      (error) => {
        console.error("ADMIN REPORT ERROR:", error);

        setError(
          "We couldn't load the reports."
        );

        setLoadingReports(false);
      }
    );

    return () => unsubscribe();
  }, []);


  // ==========================================
  // APPROVE POST
  // ==========================================

  const approvePost = async (postId) => {
    try {
      await updateDoc(
        doc(db, "posts", postId),
        {
          status: "approved"
        }
      );

    } catch (error) {
      console.error("APPROVE ERROR:", error);

      alert(
        "Couldn't approve this post."
      );
    }
  };


  // ==========================================
  // REJECT POST
  // ==========================================

  const rejectPost = async (postId) => {
    try {
      await updateDoc(
        doc(db, "posts", postId),
        {
          status: "rejected"
        }
      );

    } catch (error) {
      console.error("REJECT ERROR:", error);

      alert(
        "Couldn't reject this post."
      );
    }
  };


  // ==========================================
  // DELETE POST
  // ==========================================

  const deletePost = async (postId) => {
    const confirmed = window.confirm(
      "Permanently delete this post?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteDoc(
        doc(db, "posts", postId)
      );

    } catch (error) {
      console.error("DELETE ERROR:", error);

      alert(
        "Couldn't delete this post."
      );
    }
  };


  // ==========================================
  // DISMISS REPORT
  // ==========================================

  const dismissReport = async (reportId) => {
    try {
      await updateDoc(
        doc(db, "reports", reportId),
        {
          status: "dismissed"
        }
      );

    } catch (error) {
      console.error("DISMISS REPORT ERROR:", error);

      alert(
        "Couldn't dismiss this report."
      );
    }
  };


  // ==========================================
  // REMOVE REPORTED POST
  // ==========================================

  const removeReportedPost = async (report) => {
    const confirmed = window.confirm(
      "Remove this reported post?"
    );

    if (!confirmed) {
      return;
    }

    try {

      // Delete the reported post
      await deleteDoc(
        doc(db, "posts", report.postId)
      );

      // Mark the report as resolved
      await updateDoc(
        doc(db, "reports", report.id),
        {
          status: "resolved"
        }
      );

      alert(
        "Post removed and report resolved."
      );

    } catch (error) {
      console.error(
        "REMOVE REPORTED POST ERROR:",
        error
      );

      alert(
        "Couldn't remove the reported post."
      );
    }
  };


  // ==========================================
  // FILTER DATA
  // ==========================================

  const pendingPosts = posts.filter(
    (post) => post.status === "pending"
  );

  const pendingReports = reports.filter(
    (report) => report.status === "pending"
  );


  // ==========================================
  // FIND POST FOR REPORT
  // ==========================================

  const findReportedPost = (postId) => {
    return posts.find(
      (post) => post.id === postId
    );
  };


  return (
    <main className="admin-page">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="admin-header">

        <div>

          <p className="admin-label">
            🛡️ ADMINISTRATION
          </p>

          <h1>
            Suara Hati Moderation
          </h1>

          <p>
            Review posts and community reports.
          </p>

        </div>


        <div className="admin-stats-row">

          <div className="admin-stat">

            <strong>
              {pendingPosts.length}
            </strong>

            <span>
              Pending Posts
            </span>

          </div>


          <div className="admin-stat">

            <strong>
              {pendingReports.length}
            </strong>

            <span>
              Reports
            </span>

          </div>

        </div>

      </div>


      {error && (
        <div className="auth-error">
          {error}
        </div>
      )}


      {/* ======================================
          PENDING POSTS
      ====================================== */}

      <section className="admin-section">

        <h2>
          📝 Pending Posts
        </h2>


        {loadingPosts && (
          <p className="empty-message">
            Loading moderation queue...
          </p>
        )}


        {!loadingPosts &&
          pendingPosts.length === 0 && (

          <div className="empty-message">

            <div className="empty-icon">
              🛡️
            </div>

            <h3>
              No pending posts
            </h3>

            <p>
              Your post moderation queue is clear.
            </p>

          </div>
        )}


        <div className="admin-post-list">

          {pendingPosts.map((post) => (

            <article
              className="admin-post"
              key={post.id}
            >

              <div className="admin-post-top">

                <span>
                  🌙 Anonymous
                </span>

                <span>
                  Pending Review
                </span>

              </div>


              <p className="admin-post-content">
                {post.content}
              </p>


              <div className="admin-actions">

                <button
                  className="approve-button"
                  onClick={() =>
                    approvePost(post.id)
                  }
                >
                  ✅ Approve
                </button>


                <button
                  className="reject-button"
                  onClick={() =>
                    rejectPost(post.id)
                  }
                >
                  ❌ Reject
                </button>


                <button
                  className="delete-button"
                  onClick={() =>
                    deletePost(post.id)
                  }
                >
                  🗑️ Delete
                </button>

              </div>

            </article>

          ))}

        </div>

      </section>


      {/* ======================================
          REPORTS
      ====================================== */}

      <section className="admin-section">

        <h2>
          🚩 Reports
        </h2>


        {loadingReports && (
          <p className="empty-message">
            Loading reports...
          </p>
        )}


        {!loadingReports &&
          pendingReports.length === 0 && (

          <div className="empty-message">

            <div className="empty-icon">
              ✅
            </div>

            <h3>
              No pending reports
            </h3>

            <p>
              No community reports need review.
            </p>

          </div>
        )}


        <div className="admin-post-list">

          {pendingReports.map((report) => {

            const reportedPost =
              findReportedPost(report.postId);

            return (

              <article
                className="admin-post report-card"
                key={report.id}
              >

                <div className="admin-post-top">

                  <span>
                    🚩 Report
                  </span>

                  <span>
                    Pending Review
                  </span>

                </div>


                <div className="report-info">

                  <strong>
                    Reason
                  </strong>

                  <p>
                    {report.reason}
                  </p>

                </div>


                {report.details && (

                  <div className="report-info">

                    <strong>
                      Reporter Details
                    </strong>

                    <p>
                      {report.details}
                    </p>

                  </div>

                )}


                <div className="reported-post-box">

                  <strong>
                    Reported Post
                  </strong>


                  {reportedPost ? (

                    <p>
                      {reportedPost.content}
                    </p>

                  ) : (

                    <p>
                      This post has already been removed.
                    </p>

                  )}

                </div>


                <div className="admin-actions">

                  <button
                    className="approve-button"
                    onClick={() =>
                      dismissReport(report.id)
                    }
                  >
                    ✅ Keep Post
                  </button>


                  {reportedPost && (

                    <button
                      className="reject-button"
                      onClick={() =>
                        removeReportedPost(report)
                      }
                    >
                      🗑️ Remove Post
                    </button>

                  )}

                </div>

              </article>

            );

          })}

        </div>

      </section>

    </main>
  );
}

export default Admin;