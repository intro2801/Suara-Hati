import "./Admin.css";
import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";

import { db } from "../firebase";

function Admin() {
  const [posts, setPosts] = useState([]);
  const [reports, setReports] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const postsQuery = query(collection(db, "posts"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      postsQuery,
      (snapshot) => {
        setPosts(snapshot.docs.map((post) => ({ id: post.id, ...post.data() })));
        setLoadingPosts(false);
      },
      (err) => {
        console.error("ADMIN POSTS ERROR:", err.code, err.message);
        setError("We couldn't load the moderation posts.");
        setLoadingPosts(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const reportsQuery = query(collection(db, "reports"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      reportsQuery,
      (snapshot) => {
        setReports(snapshot.docs.map((report) => ({ id: report.id, ...report.data() })));
        setLoadingReports(false);
      },
      (err) => {
        console.error("ADMIN REPORT ERROR:", err.code, err.message);
        setError("We couldn't load the reports.");
        setLoadingReports(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const approvePost = async (postId) => {
    try {
      await updateDoc(doc(db, "posts", postId), { status: "approved" });
    } catch (err) {
      console.error("APPROVE ERROR:", err.code, err.message);
      alert("Couldn't approve this post.");
    }
  };

  const rejectPost = async (postId) => {
    try {
      await updateDoc(doc(db, "posts", postId), { status: "rejected" });
    } catch (err) {
      console.error("REJECT ERROR:", err.code, err.message);
      alert("Couldn't reject this post.");
    }
  };

  const deletePost = async (postId) => {
    if (!window.confirm("Permanently delete this post?")) return;

    try {
      await deleteDoc(doc(db, "posts", postId));
    } catch (err) {
      console.error("DELETE ERROR:", err.code, err.message);
      alert("Couldn't delete this post.");
    }
  };

  const dismissReport = async (reportId) => {
    try {
      await updateDoc(doc(db, "reports", reportId), { status: "dismissed" });
    } catch (err) {
      console.error("DISMISS REPORT ERROR:", err.code, err.message);
      alert("Couldn't dismiss this report.");
    }
  };

  const removeReportedPost = async (report) => {
    if (!window.confirm("Remove this reported post?")) return;

    try {
      await deleteDoc(doc(db, "posts", report.postId));
      await updateDoc(doc(db, "reports", report.id), { status: "resolved" });
      alert("Post removed and report resolved.");
    } catch (err) {
      console.error("REMOVE REPORTED POST ERROR:", err.code, err.message);
      alert("Couldn't remove the reported post.");
    }
  };

  const pendingPosts = posts.filter((post) => post.status === "pending");
  const pendingReports = reports.filter((report) => report.status === "pending");

  const findReportedPost = (postId) => posts.find((post) => post.id === postId);

  return (
    <main className="admin-page">
      <div className="admin-header">
        <div>
          <p className="admin-label">🛡️ ADMINISTRATION</p>
          <h1>Suara Hati Moderation</h1>
          <p>Review posts and community reports.</p>
        </div>

        <div className="admin-stats-row">
          <div className="admin-stat">
            <strong>{pendingPosts.length}</strong>
            <span>Pending Posts</span>
          </div>

          <div className="admin-stat">
            <strong>{pendingReports.length}</strong>
            <span>Reports</span>
          </div>
        </div>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <section className="admin-section">
        <h2>📝 Pending Posts</h2>

        {loadingPosts && <p className="empty-message">Loading moderation queue...</p>}

        {!loadingPosts && pendingPosts.length === 0 && (
          <div className="empty-message">
            <div className="empty-icon">🛡️</div>
            <h3>No pending posts</h3>
            <p>Your post moderation queue is clear.</p>
          </div>
        )}

        <div className="admin-post-list">
          {pendingPosts.map((post) => (
            <article className="admin-post" key={post.id}>
              <div className="admin-post-top">
                <span>🌙 Anonymous</span>
                <span>Pending Review</span>
              </div>

              <p className="admin-post-content">{post.content}</p>

              <div className="admin-actions">
                <button className="approve-button" onClick={() => approvePost(post.id)}>
                  ✅ Approve
                </button>
                <button className="reject-button" onClick={() => rejectPost(post.id)}>
                  ❌ Reject
                </button>
                <button className="delete-button" onClick={() => deletePost(post.id)}>
                  🗑️ Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-section">
        <h2>🚩 Reports</h2>

        {loadingReports && <p className="empty-message">Loading reports...</p>}

        {!loadingReports && pendingReports.length === 0 && (
          <div className="empty-message">
            <div className="empty-icon">✅</div>
            <h3>No pending reports</h3>
            <p>No community reports need review.</p>
          </div>
        )}

        <div className="admin-post-list">
          {pendingReports.map((report) => {
            const reportedPost = findReportedPost(report.postId);

            return (
              <article className="admin-post report-card" key={report.id}>
                <div className="admin-post-top">
                  <span>🚩 Report</span>
                  <span>Pending Review</span>
                </div>

                <div className="report-info">
                  <strong>Reason</strong>
                  <p>{report.reason}</p>
                </div>

                {report.details && (
                  <div className="report-info">
                    <strong>Reporter Details</strong>
                    <p>{report.details}</p>
                  </div>
                )}

                <div className="reported-post-box">
                  <strong>Reported Post</strong>
                  {reportedPost ? (
                    <p>{reportedPost.content}</p>
                  ) : (
                    <p>This post has already been removed.</p>
                  )}
                </div>

                <div className="admin-actions">
                  <button className="approve-button" onClick={() => dismissReport(report.id)}>
                    ✅ Keep Post
                  </button>

                  {reportedPost && (
                    <button className="reject-button" onClick={() => removeReportedPost(report)}>
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