import { useEffect, useState } from "react";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc
} from "firebase/firestore";

import { db } from "./firebase";

import ModerationModal from "../modals/ModerationModal";

import overviewEnvelope from "../assets/letter-open.png";

function Admin() {
  const [posts, setPosts] = useState([]);
  const [reports, setReports] = useState([]);
  const [letters, setLetters] = useState([]);
  const [replies, setReplies] = useState([]);
  const [users, setUsers] = useState([]);
  const [moderationTarget, setModerationTarget] = useState(null);
  const [moderationAction, setModerationAction] = useState("");
  const [moderationLogs, setModerationLogs] = useState([]);
  const [loadingModerationLogs, setLoadingModerationLogs] = useState(true); 
  const [letterReports, setLetterReports] = useState([]);
  const [loadingLetterReports, setLoadingLetterReports] = useState(true);

  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);
  const [loadingLetters, setLoadingLetters] = useState(true);
  const [loadingReplies, setLoadingReplies] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [error, setError] = useState("");

  const [activeAdminTab, setActiveAdminTab] = useState("overview");
  const [historyFilter, setHistoryFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeUserActivityTab, setActiveUserActivityTab] = useState("posts");
  const [selectedActivity, setSelectedActivity] = useState(null);

  const [userSearch, setUserSearch] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState("all");

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
// LOAD USERS
// ==========================================

useEffect(() => {

  const usersQuery = query(
    collection(db, "users")
  );

  const unsubscribe = onSnapshot(
    usersQuery,

    (snapshot) => {

      const userList = snapshot.docs.map(
        (userDocument) => ({
          id: userDocument.id,
          ...userDocument.data()
        })
      );

      setUsers(userList);

      setLoadingUsers(false);
    },

    (error) => {

      console.error(
        "ADMIN USERS ERROR:",
        error
      );

      setError(
        "We couldn't load users."
      );

      setLoadingUsers(false);
    }
  );

  return () => unsubscribe();

}, []);

// ==========================================
// LOAD MODERATION HISTORY
// ==========================================

useEffect(() => {
  const logsQuery = query(
    collection(db, "moderationLogs")
  );

  const unsubscribe = onSnapshot(
    logsQuery,

    (snapshot) => {
      const logList = snapshot.docs
        .map((logDocument) => ({
          id: logDocument.id,
          ...logDocument.data()
        }))
        .sort((a, b) => {
          const aTime =
            a.createdAt?.toMillis?.() ||
            a.createdAt?.getTime?.() ||
            0;

          const bTime =
            b.createdAt?.toMillis?.() ||
            b.createdAt?.getTime?.() ||
            0;

          return bTime - aTime;
        });

      setModerationLogs(logList);
      setLoadingModerationLogs(false);
    },

    (error) => {
      console.error(
        "MODERATION HISTORY ERROR:",
        error
      );

      setError(
        "We couldn't load moderation history."
      );

      setLoadingModerationLogs(false);
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
// LOAD LETTERS
// ==========================================

useEffect(() => {
  const lettersQuery = query(
    collection(db, "letters"),
    orderBy("createdAt", "desc")
  );

  const unsubscribe = onSnapshot(
    lettersQuery,

    (snapshot) => {
      const letterList = snapshot.docs.map((letter) => ({
        id: letter.id,
        ...letter.data()
      }));

      setLetters(letterList);
      setLoadingLetters(false);
    },

    (error) => {
      console.error("ADMIN LETTER ERROR:", error);

      setError(
        "We couldn't load the letters."
      );

      setLoadingLetters(false);
    }
  );

  return () => unsubscribe();

}, []);

// ==========================================
// LOAD LETTER REPLIES
// ==========================================

useEffect(() => {
  const repliesQuery = query(
    collection(db, "letterReplies"),
    orderBy("createdAt", "desc")
  );

  const unsubscribe = onSnapshot(
    repliesQuery,

    (snapshot) => {
      const replyList = snapshot.docs.map((reply) => ({
        id: reply.id,
        ...reply.data()
      }));

      setReplies(replyList);
      setLoadingReplies(false);
    },

    (error) => {
      console.error(
        "ADMIN REPLY ERROR:",
        error
      );

      setError(
        "We couldn't load the replies."
      );

      setLoadingReplies(false);
    }
  );

  return () => unsubscribe();

}, []);

// ==========================================
// LOAD LETTER REPORTS
// ==========================================

useEffect(() => {
  const reportsQuery = query(
    collection(db, "letterReports")
  );

  const unsubscribe = onSnapshot(
    reportsQuery,
    (snapshot) => {
      const reportList = snapshot.docs
        .map((reportDocument) => ({
          id: reportDocument.id,
          ...reportDocument.data()
        }))
        .sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() || 0;
          const bTime = b.createdAt?.toMillis?.() || 0;

          return bTime - aTime;
        });

      setLetterReports(reportList);
      setLoadingLetterReports(false);
    },
    (error) => {
      console.error(
        "LETTER REPORT LOAD ERROR:",
        error
      );

      setError(
        "We couldn't load letter reports."
      );

      setLoadingLetterReports(false);
    }
  );

  return () => unsubscribe();

}, []);

// ==========================================
// APPROVE REPLY
// ==========================================

const approveReply = async (replyId) => {
  try {
    await updateDoc(
      doc(db, "letterReplies", replyId),
      {
        status: "approved"
      }
    );

  } catch (error) {
    console.error(
      "APPROVE REPLY ERROR:",
      error
    );

    alert(
      "Couldn't approve this reply."
    );
  }
};


// ==========================================
// REJECT REPLY
// ==========================================

const rejectReply = async (replyId) => {
  try {
    await updateDoc(
      doc(db, "letterReplies", replyId),
      {
        status: "rejected"
      }
    );

  } catch (error) {
    console.error(
      "REJECT REPLY ERROR:",
      error
    );

    alert(
      "Couldn't reject this reply."
    );
  }
};


// ==========================================
// DELETE REPLY
// ==========================================

const deleteReplyAdmin = async (replyId) => {
  const confirmed = window.confirm(
    "Permanently delete this reply?"
  );

  if (!confirmed) {
    return;
  }

  try {
    await deleteDoc(
      doc(db, "letterReplies", replyId)
    );

  } catch (error) {
    console.error(
      "DELETE REPLY ERROR:",
      error
    );

    alert(
      "Couldn't delete this reply."
    );
  }
};

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
// APPROVE LETTER
// ==========================================

const approveLetter = async (letterId) => {
  try {
    await updateDoc(
      doc(db, "letters", letterId),
      {
        status: "approved"
      }
    );

  } catch (error) {
    console.error(
      "APPROVE LETTER ERROR:",
      error
    );

    alert(
      "Couldn't approve this letter."
    );
  }
};


// ==========================================
// REJECT LETTER
// ==========================================

const rejectLetter = async (letterId) => {
  try {
    await updateDoc(
      doc(db, "letters", letterId),
      {
        status: "rejected"
      }
    );

  } catch (error) {
    console.error(
      "REJECT LETTER ERROR:",
      error
    );

    alert(
      "Couldn't reject this letter."
    );
  }
};


// ==========================================
// DELETE LETTER
// ==========================================

const deleteLetterAdmin = async (letterId) => {
  const confirmed = window.confirm(
    "Permanently delete this letter?"
  );

  if (!confirmed) {
    return;
  }

  try {
    await deleteDoc(
      doc(db, "letters", letterId)
    );

  } catch (error) {
    console.error(
      "DELETE LETTER ERROR:",
      error
    );

    alert(
      "Couldn't delete this letter."
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

  const pendingLetters = letters.filter(
  (letter) => letter.status === "pending"
  );

  const pendingReplies = replies.filter(
  (reply) => reply.status === "pending"
  );

  const pendingLetterReports = letterReports.filter(
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

  const applyModerationAction = async ({
  reason,
  note
}) => {
  if (!moderationTarget || !moderationAction) {
    return;
  }

  try {
    const account = moderationTarget;

    if (moderationAction === "warning") {
      await addDoc(
        collection(db, "moderationLogs"),
        {
          userId: account.id,
          username: account.username || "",
          action: "warning",
          reason: reason,
          note: note,
          createdAt: new Date()
        }
      );
    } else {
      await updateDoc(
        doc(db, "users", account.id),
        {
          status: moderationAction,
          moderationReason: reason,
          moderationNote: note
        }
      );

      await addDoc(
        collection(db, "moderationLogs"),
        {
          userId: account.id,
          username: account.username || "",
          action: moderationAction,
          reason: reason,
          note: note,
          createdAt: new Date()
        }
      );
    }

    setModerationTarget(null);
    setModerationAction("");

} catch (error) {
  console.error(
    "MODERATION ACTION ERROR:",
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

  alert(
    `Moderation error: ${error.code} — ${error.message}`
  );
}

};

  const formatModerationDate = (timestamp) => {
  if (!timestamp) {
    return "Just now";
  }

  if (timestamp.toDate) {
    return timestamp.toDate().toLocaleString();
  }

  if (timestamp instanceof Date) {
    return timestamp.toLocaleString();
  }

  return "Unknown date";
};

const deleteModerationLog = async (logId) => {
  const confirmed = window.confirm(
    "Delete this moderation history record?"
  );

  if (!confirmed) {
    return;
  }

  try {
    await deleteDoc(
      doc(db, "moderationLogs", logId)
    );
  } catch (error) {
    console.error(
      "DELETE MODERATION LOG ERROR:",
      error
    );

    alert(
      "Couldn't delete this moderation history."
    );
  }
};

const getWarningCount = (userId) => {
  const userLogs = moderationLogs
    .filter((log) => log.userId === userId)
    .sort((a, b) => {
      const aTime =
        a.createdAt?.toMillis?.() ||
        a.createdAt?.getTime?.() ||
        0;

      const bTime =
        b.createdAt?.toMillis?.() ||
        b.createdAt?.getTime?.() ||
        0;

      return aTime - bTime;
    });

  let count = 0;

  userLogs.forEach((log) => {
    if (log.action === "warning_reset") {
      count = 0;
    }

    if (log.action === "warning") {
      count += 1;
    }
  });

  return count;
};

const resetWarnings = async (account) => {
  const currentWarnings = getWarningCount(account.id);

  if (currentWarnings === 0) {
    alert("This user already has 0 active warnings.");
    return;
  }

  const confirmed = window.confirm(
    `Reset @${account.username || "this user"}'s warning count from ${currentWarnings} to 0?`
  );

  if (!confirmed) {
    return;
  }

  try {
    await addDoc(
      collection(db, "moderationLogs"),
      {
        userId: account.id,
        username: account.username || "",
        action: "warning_reset",
        reason: "Warning count reset",
        note: `Warning count reset from ${currentWarnings} to 0 by an administrator.`,
        createdAt: new Date()
      }
    );

  } catch (error) {
    console.error(
      "RESET WARNINGS ERROR:",
      error
    );

    alert(
      "Couldn't reset this user's warnings."
    );
  }
};

const dismissLetterReport = async (reportId) => {
  try {
    await updateDoc(
      doc(db, "letterReports", reportId),
      {
        status: "dismissed"
      }
    );

  } catch (error) {
    console.error(
      "DISMISS LETTER REPORT ERROR:",
      error
    );

    alert(
      "Couldn't dismiss this letter report."
    );
  }
};

const removeReportedLetter = async (report) => {
  const confirmed = window.confirm(
    "Delete this reported letter permanently?"
  );

  if (!confirmed) {
    return;
  }

  try {
    await deleteDoc(
      doc(db, "letters", report.letterId)
    );

    await updateDoc(
      doc(db, "letterReports", report.id),
      {
        status: "resolved"
      }
    );

    alert(
      "Reported letter removed."
    );

  } catch (error) {
    console.error(
      "REMOVE REPORTED LETTER ERROR:",
      error
    );

    alert(
      "Couldn't remove this reported letter."
    );
  }
};

const findLetterById = (letterId) => {
  return letters.find(
    (letter) => letter.id === letterId
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

  </div>

      <div className="letter-tabs admin-tabs">

          <button
            className={`letter-tab ${
            activeAdminTab === "overview" ? "active" : ""
        }`}
            onClick={() => setActiveAdminTab("overview")}
        >
            🏠 Overview
            </button>
          
          <button
            className={`letter-tab ${
            activeAdminTab === "posts" ? "active" : ""
        }`}
            onClick={() => setActiveAdminTab("posts")}
        >
           📝 Pending Posts
           <span className="letter-tab-count">
             {pendingPosts.length}
           </span>
          </button>

          <button
            className={`letter-tab ${
            activeAdminTab === "reports" ? "active" : ""
        }`}
            onClick={() => setActiveAdminTab("reports")}
        >
           🚩 Reports
    <span className="letter-tab-count">
      {pendingReports.length}
    </span>
  </button>

  <button
    className={`letter-tab ${
      activeAdminTab === "letters" ? "active" : ""
    }`}
    onClick={() => setActiveAdminTab("letters")}
  >
    💌 Pending Letters
    <span className="letter-tab-count">
      {pendingLetters.length}
    </span>
  </button>

  <button
    className={`letter-tab ${
      activeAdminTab === "replies" ? "active" : ""
    }`}
    onClick={() => setActiveAdminTab("replies")}
  >
    💬 Pending Replies
    <span className="letter-tab-count">
      {pendingReplies.length}
    </span>
  </button>

  <button
    className={`letter-tab ${
      activeAdminTab === "letterReports" ? "active" : ""
    }`}
    onClick={() => setActiveAdminTab("letterReports")}
  >
    🚩💌 Letter Reports
    <span className="letter-tab-count">
      {pendingLetterReports.length}
    </span>
  </button>

  <button
  className={`letter-tab ${
    activeAdminTab === "users" ? "active" : ""
  }`}
  onClick={() => setActiveAdminTab("users")}
>
  👥 Users
  <span className="letter-tab-count">
    {users.length}
  </span>
</button>

<button
  className={`letter-tab ${
    activeAdminTab === "history" ? "active" : ""
  }`}
  onClick={() => setActiveAdminTab("history")}
>
  📜 History
  <span className="letter-tab-count">
    {moderationLogs.length}
  </span>
</button>

</div>

      {error && (
        <div className="auth-error">
          {error}
        </div>
      )}


      {/* ======================================
          PENDING POSTS
          ====================================== */}
      
      {activeAdminTab === "overview" && (
  <section className="admin-section overview-section">

    <div className="overview-hero">

      <div>
        <p className="admin-label">
          💌 SUARA HATI OVERVIEW
        </p>

        <h2>
          Welcome back, Admin! 💌
        </h2>

        <p>
          Here's what's happening in Suara Hati today.
        </p>
      </div>

      <div className="overview-envelope">
        💌
      </div>

    </div>


    <div className="overview-grid">

      <div className="overview-card">
        <span>📝 Pending Posts</span>
        <strong>{pendingPosts.length}</strong>
      </div>

      <div className="overview-card">
        <span>💌 Pending Letters</span>
        <strong>{pendingLetters.length}</strong>
      </div>

      <div className="overview-card">
        <span>💬 Pending Replies</span>
        <strong>{pendingReplies.length}</strong>
      </div>

      <div className="overview-card">
        <span>🚩 Reports</span>
        <strong>
          {pendingReports.length + pendingLetterReports.length}
        </strong>
      </div>

      <div className="overview-card">
        <span>👥 Users</span>
        <strong>{users.length}</strong>
      </div>

    </div>

  </section>
)}

      {activeAdminTab === "posts" && (            

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
                  🌙 {post.authorUsername || "User"}
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

    )}

      {/* ======================================
          REPORTS
          ====================================== */}
      
      {activeAdminTab === "reports" && (

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

          // ==========================================
          // CHANGE ACCOUNT STATUS
          // ==========================================

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
      )}

      {/* ======================================
          PENDING LETTERS
          ====================================== */}

        {activeAdminTab === "letters" && (

        <section className="admin-section">

  <h2>
    💌 Pending Letters
  </h2>


  {loadingLetters && (
    <p className="empty-message">
      Loading letters...
    </p>
  )}


  {!loadingLetters &&
    pendingLetters.length === 0 && (

    <div className="empty-message">

      <div className="empty-icon">
        💌
      </div>

      <h3>
        No pending letters
      </h3>

      <p>
        There are no care letters waiting for review.
      </p>

    </div>
  )}


  <div className="admin-post-list">

    {pendingLetters.map((letter) => (

      <article
        className="admin-post"
        key={letter.id}
      >

        <div className="admin-post-top">

          <span>
            💌 From @{letter.senderUsername || "Unknown"}
          </span>

          <span>
            Pending Review
          </span>

        </div>


        <div className="reported-post-box">

          <strong>
            Care Letter
          </strong>

          <p>
            {letter.message}
          </p>

        </div>


        <div className="report-info">

          <strong>
            Sender UID
          </strong>

          <p>
            {letter.senderId}
          </p>

        </div>


        <div className="report-info">

          <strong>
            Receiver UID
          </strong>

          <p>
            {letter.receiverId}
          </p>

        </div>


        <div className="admin-actions">

          <button
            className="approve-button"
            onClick={() =>
              approveLetter(letter.id)
            }
          >
            ✅ Approve
          </button>


          <button
            className="reject-button"
            onClick={() =>
              rejectLetter(letter.id)
            }
          >
            ❌ Reject
          </button>


          <button
            className="delete-button"
            onClick={() =>
              deleteLetterAdmin(letter.id)
            }
          >
            🗑️ Delete
          </button>

        </div>

      </article>

    ))}

  </div>

</section>
)}

{/* ======================================
    PENDING REPLIES
    ====================================== */}

    {activeAdminTab === "replies" && (

<section className="admin-section">

  <h2>
    💬 Pending Replies
  </h2>


  {loadingReplies && (
    <p className="empty-message">
      Loading replies...
    </p>
  )}


  {!loadingReplies &&
    pendingReplies.length === 0 && (

    <div className="empty-message">

      <div className="empty-icon">
        💬
      </div>

      <h3>
        No pending replies
      </h3>

      <p>
        There are no replies waiting for review.
      </p>

    </div>
  )}


  <div className="admin-post-list">

    {pendingReplies.map((reply) => (

      <article
        className="admin-post"
        key={reply.id}
      >

        <div className="admin-post-top">

          <span>
            💬 From @{reply.senderUsername || "Unknown"}
          </span>

          <span>
            Pending Review
          </span>

        </div>


        <div className="reported-post-box">

          <strong>
            Reply
          </strong>

          <p>
            {reply.message}
          </p>

        </div>


        <div className="report-info">

          <strong>
            Sender UID
          </strong>

          <p>
            {reply.senderId}
          </p>

        </div>


        <div className="report-info">

          <strong>
            Receiver UID
          </strong>

          <p>
            {reply.receiverId}
          </p>

        </div>


        <div className="admin-actions">

          <button
            className="approve-button"
            onClick={() =>
              approveReply(reply.id)
            }
          >
            ✅ Approve
          </button>


          <button
            className="reject-button"
            onClick={() =>
              rejectReply(reply.id)
            }
          >
            ❌ Reject
          </button>


          <button
            className="delete-button"
            onClick={() =>
              deleteReplyAdmin(reply.id)
            }
          >
            🗑️ Delete
          </button>

        </div>

      </article>
  
    ))}

  </div>

</section>

)}

{/* ======================================
    USER MANAGEMENT
    ====================================== */}

    {activeAdminTab === "users" && (

<section className="admin-section">

  <h2>
    👥 User Management
  </h2>

  <div className="admin-user-search">
  <input
    type="text"
    placeholder="Search username or email..."
    value={userSearch}
    onChange={(e) => setUserSearch(e.target.value)}
  />
  </div>

  <div className="letter-tabs admin-tabs">

  <button
    className={`letter-tab ${
      userStatusFilter === "all" ? "active" : ""
    }`}
    onClick={() => setUserStatusFilter("all")}
  >
    👥 All
    <span className="letter-tab-count">
      {users.length}
    </span>
  </button>

  <button
    className={`letter-tab ${
      userStatusFilter === "active" ? "active" : ""
    }`}
    onClick={() => setUserStatusFilter("active")}
  >
    🟢 Active
    <span className="letter-tab-count">
  {
    users.filter(
      (account) =>
        !account.status ||
        account.status === "active"
    ).length
  }
</span>
  </button>

  <button
    className={`letter-tab ${
      userStatusFilter === "suspended" ? "active" : ""
    }`}
    onClick={() => setUserStatusFilter("suspended")}
  >
    ⏸ Suspended
    <span className="letter-tab-count">
      {
        users.filter(
          (account) =>
            account.status === "suspended"
        ).length
      }
    </span>
  </button>

  <button
    className={`letter-tab ${
      userStatusFilter === "banned" ? "active" : ""
    }`}
    onClick={() => setUserStatusFilter("banned")}
  >
    🚫 Banned
    <span className="letter-tab-count">
      {
        users.filter(
          (account) =>
            account.status === "banned"
        ).length
      }
    </span>
  </button>

  <button
    className={`letter-tab ${
      userStatusFilter === "warningLimit" ? "active" : ""
    }`}
    onClick={() => setUserStatusFilter("warningLimit")}
  >
    ⚠️ Warning Limit
    <span className="letter-tab-count">
      {
        users.filter(
          (account) =>
            account.status === "warningLimit"
        ).length
      }
    </span>
  </button>

</div>


  {loadingUsers && (
    <p className="empty-message">
      Loading users...
    </p>
  )}


  {!loadingUsers &&
    users.length === 0 && (

    <div className="empty-message">

      <h3>No users found</h3>

    </div>
  )}

  {selectedUser && (
  <div className="admin-user-details">

    <div className="admin-user-details-header">
      <div>
        <p className="admin-label">
          👤 USER DETAILS
        </p>

        <h2>
          @{selectedUser.username || "Unknown"}
        </h2>
      </div>

      <button
        type="button"
        className="delete-button"
        onClick={() => setSelectedUser(null)}
      >
        ✕ Close
      </button>
    </div>

{selectedActivity && (
<div className="admin-user-details-grid">

  <div>
    <span>Type</span>
    <strong>
      {selectedActivity?.type}
    </strong>
  </div>

  <div>
    <span>Status</span>
    <strong>
      {selectedActivity?.data?.status || "unknown"}
    </strong>
  </div>

  <div>
    <span>Date & Time</span>
    <strong>
      {formatModerationDate(
        selectedActivity?.data?.createdAt
      )}
    </strong>
  </div>

  <div>
    <span>Activity ID</span>
    <strong>
      {selectedActivity?.data?.id}
    </strong>
  </div>


  {selectedActivity?.type === "post" && (
    <>
      <div>
        <span>Author</span>
        <strong>
          @{selectedActivity?.data?.authorUsername || selectedUser?.username || "Unknown"}
        </strong>
      </div>

      <div>
        <span>Author UID</span>
        <strong>
          {selectedActivity?.data?.authorId || "Unknown"}
        </strong>
      </div>
    </>
  )}


  {selectedActivity?.type === "letter" && (
  <>
    <div>
      <span>Sender</span>
      <strong>
        @{
          selectedActivity?.data?.senderUsername ||
          getUsernameById(selectedActivity?.data?.senderId)
        }
      </strong>
    </div>

    <div>
      <span>Receiver</span>
      <strong>
        @{getUsernameById(selectedActivity?.data?.receiverId)}
      </strong>
    </div>

    <div>
      <span>Sender UID</span>
      <strong>
        {selectedActivity?.data?.senderId || "Unknown"}
      </strong>
    </div>

    <div>
      <span>Receiver UID</span>
      <strong>
        {selectedActivity?.data?.receiverId || "Unknown"}
      </strong>
    </div>

    <div>
      <span>Related Post ID</span>
      <strong>
        {selectedActivity?.data?.postId || "Unknown"}
      </strong>
    </div>
  </>
)}


  {selectedActivity?.type === "reply" && (
  <>
    <div>
      <span>Sender</span>
      <strong>
        @{
          selectedActivity?.data?.senderUsername ||
          getUsernameById(selectedActivity?.data?.senderId)
        }
      </strong>
    </div>

    <div>
      <span>Receiver</span>
      <strong>
        @{getUsernameById(selectedActivity?.data?.receiverId)}
      </strong>
    </div>

    <div>
      <span>Sender UID</span>
      <strong>
        {selectedActivity?.data?.senderId || "Unknown"}
      </strong>
    </div>

    <div>
      <span>Receiver UID</span>
      <strong>
        {selectedActivity.data.receiverId || "Unknown"}
      </strong>
    </div>

    <div>
      <span>Related Letter ID</span>
      <strong>
        {selectedActivity.data.letterId || "Unknown"}
      </strong>
    </div>
  </>
)}

  <div className="admin-user-activity">

  <h3>
    {selectedActivity?.type === "post" && "📝 Post Content"}
    {selectedActivity?.type === "letter" && "💌 Letter Message"}
    {selectedActivity?.type === "reply" && "💬 Reply Message"}
  </h3>

  <div className="admin-user-activity-card">
    <p>
      {selectedActivity?.data?.content ||
        selectedActivity?.data?.message ||
        "No message"}
    </p>
  </div>

</div>

{selectedActivity?.type === "post" && (
  <div className="admin-activity-actions">

    {selectedActivity?.data?.status === "pending" && (
      <>
        <button
          type="button"
          className="approve-button"
          onClick={async () => {
            await approvePost(selectedActivity.data.id);
            setSelectedActivity(null);
          }}
        >
          ✅ Approve
        </button>

        <button
          type="button"
          className="reject-button"
          onClick={async () => {
            await rejectPost(selectedActivity.data.id);
            setSelectedActivity(null);
          }}
        >
          ❌ Reject
        </button>
      </>
    )}

    <button
      type="button"
      className="delete-button"
      onClick={async () => {
        await deletePost(selectedActivity.data.id);
        setSelectedActivity(null);
      }}
    >
      🗑 Delete
    </button>

  </div>
)}

{selectedActivity?.type === "letter" && (
  <div className="admin-activity-actions">

    {selectedActivity?.data?.status === "pending" && (
      <>
        <button
          type="button"
          className="approve-button"
          onClick={async () => {
            await approveLetter(selectedActivity.data.id);
            setSelectedActivity(null);
          }}
        >
          ✅ Approve
        </button>

        <button
          type="button"
          className="reject-button"
          onClick={async () => {
            await rejectLetter(selectedActivity.data.id);
            setSelectedActivity(null);
          }}
        >
          ❌ Reject
        </button>
      </>
    )}

    <button
      type="button"
      className="delete-button"
      onClick={async () => {
        await deleteLetterAdmin(selectedActivity.data.id);
        setSelectedActivity(null);
      }}
    >
      🗑 Delete
    </button>

  </div>
)}

</div>
)}

{selectedActivity?.type === "reply" && (
  <div className="admin-activity-actions">

    {selectedActivity?.data?.status === "pending" && (
      <>
        <button
          type="button"
          className="approve-button"
          onClick={async () => {
            await approveReply(selectedActivity.data.id);
            setSelectedActivity(null);
          }}
        >
          ✅ Approve
        </button>

        <button
          type="button"
          className="reject-button"
          onClick={async () => {
            await rejectReply(selectedActivity.data.id);
            setSelectedActivity(null);
          }}
        >
          ❌ Reject
        </button>
      </>
    )}

    <button
      type="button"
      className="delete-button"
      onClick={async () => {
        await deleteReplyAdmin(selectedActivity.data.id);
        setSelectedActivity(null);
      }}
    >
      🗑 Delete
    </button>

  </div>
)}

    {activeUserActivityTab === "posts" && (
    <div className="admin-user-activity">
      <h3>📝 Community Posts</h3>

      {posts.filter(
        (post) => post.authorId === selectedUser.id
      ).length === 0 ? (

        <p className="empty-message">
          No community posts from this user.
        </p>

      ) : (

        <div className="admin-user-activity-list">

          {posts
            .filter(
              (post) => post.authorId === selectedUser.id
            )
            .map((post) => (

              <div
                key={post.id}
                className="admin-user-activity-card clickable"
                onClick={() =>
                  setSelectedActivity({
                    type: "post",
                    data: post
                  })
                }
              >

                <p>
                  {post.content}
                </p>

                <span>
                  Status: {post.status || "unknown"}
                </span>

              </div>

            ))}

        </div>

      )}

    </div>
)}

{activeUserActivityTab === "letters" && (
<div className="admin-user-activity">

  <h3>💌 Letters Sent</h3>

  {letters.filter(
  (letter) => letter.senderId === selectedUser.id
).length === 0 ? (
  <p className="empty-message">
    No letters sent by this user.
  </p>
) : (
  <div className="admin-user-activity-list">

    {letters
      .filter(
        (letter) => letter.senderId === selectedUser.id
      )
      .map((letter) => (
        <div
          key={letter.id}
          className="admin-user-activity-card clickable"
          onClick={() =>
            setSelectedActivity({
               type: "letter",
              data: letter
            })
          }
        >
          <p>
            {letter.message || letter.content || "No message"}
          </p>

          <span>
            Status: {letter.status || "unknown"}
          </span>
        </div>
      ))}

  </div>
)}

</div>
)}

{activeUserActivityTab === "replies" && (
  <div className="admin-user-activity">

    <h3>💬 Replies Sent</h3>

    {replies.filter(
      (reply) => reply.senderId === selectedUser.id
    ).length === 0 ? (

      <p className="empty-message">
        No replies sent by this user.
      </p>

    ) : (

      <div className="admin-user-activity-list">

        {replies
          .filter(
            (reply) => reply.senderId === selectedUser.id
          )
          .map((reply) => (

            <div
              key={reply.id}
              className="admin-user-activity-card clickable"
              onClick={() =>
                setSelectedActivity({
                  type: "reply",
                  data: reply
                })
              }
            >
              <p>
                {reply.message || reply.content || "No reply message"}
              </p>

              <span>
                Status: {reply.status || "unknown"}
              </span>
            </div>

          ))}

      </div>

    )}

  </div>
)}

</div>
)}


  <div className="admin-user-list">

    {users.filter((account) => {
      const search = userSearch.toLowerCase().trim();

      const username = 
        account.username?.toLowerCase() || "";

      const email = 
        account.email?.toLowerCase() || "";

      const matchesSearch =
        !search ||
        username.includes(search) ||
        email.includes(search);

      let matchesStatus = true;

      if (userStatusFilter === "active") {
        matchesStatus = 
        !account.status ||
        account.status === "active";

      } 
      
      if (userStatusFilter === "suspended") {
        matchesStatus = account.status === "suspended";
      } 
      
      if (userStatusFilter === "banned") {
        matchesStatus = account.status === "banned";
      } 
      
      if (userStatusFilter === "warningLimit") {
        matchesStatus = getWarningCount(account.id) >= 3;
      }

      return matchesSearch && matchesStatus;
    })
      .map((account) => (

      <article
        className="admin-user-card"
        key={account.id}
      >

        <div className="admin-user-info">

          <div>

            <button
               type="button"
               className="admin-user-name-button"
               onClick={() => setSelectedUser(account)}
      >
           👤 @{account.username || "Unknown"}
            </button>

            <p>
               ⚠️ Warnings: {getWarningCount(account.id)}/3
            </p>

            {getWarningCount(account.id) >= 3 && (
               <p className="warning-limit-text">
                 🔴 Warning limit reached
               </p>
              )}

            <p>
              {account.email}
            </p>

          </div>


          <div
            className={
              `user-status user-status-${account.status}`
            }
          >

            {account.status}

          </div>

        </div>


        <div className="admin-user-id">

          UID:
          {" "}
          {account.id}

        </div>


        <div className="admin-actions">

          {account.status !== "active" && (
            <button
              className="approve-button"
              onClick={async () => {
                 try {
                   await updateDoc(
                     doc(db, "users", account.id),
                     {
                       status: "active",
                       moderationReason: "",
                       moderationNote: ""
                     }
                   );

                   await addDoc(
                      collection(db, "moderationLogs"),
                     {
                       userId: account.id,
                       username: account.username || "",
                       action: "restored",
                       reason: "Account restored",
                       note: "Account access was restored by an administrator.",
                       createdAt: new Date()
                     }
                   );

                 } catch (error) {
                   console.error(
                     "RESTORE USER ERROR:",
                     error
                   );

                  alert(
                    "Couldn't restore this user."
                  );
               }
             }}
           >
             ✅ Restore
          </button>
        )}

          <button
              className="delete-button"
              onClick={() => {
                setModerationTarget(account);
                setModerationAction("warning");
          }}
            >
              ⚠️ Warn
          </button>

          {account.status !== "suspended" && (
           <button
             className="delete-button"
             onClick={() => {
               setModerationTarget(account);
               setModerationAction("suspended");
              }}
             >
              ⏸️ Suspend
           </button>
          )}

          {getWarningCount(account.id) > 0 && (
           <button
             className="delete-button"
             onClick={() =>
               resetWarnings(account)
             }
           >
             🔄 Reset Warnings
           </button>
          )}

          {account.status !== "banned" && (
            <button
              className="reject-button"
              onClick={() => {
                setModerationTarget(account);
                setModerationAction("banned");
                  "banned"
                }}
            >
              🔨 Ban
            </button>

          )}

        </div>

      </article>

    ))}

  </div>

   {selectedUser && (
    <div className="admin-user-details">

      {/* User details code */}

    </div>
  )}

</section>
)}

{moderationTarget && moderationAction && (
  <ModerationModal
    account={moderationTarget}
    action={moderationAction}
    onClose={() => {
      setModerationTarget(null);
      setModerationAction("");
    }}
    onConfirm={applyModerationAction}
  />
)}

{/* ======================================
    MODERATION HISTORY
    ====================================== */}

{activeAdminTab === "history" && (
<section className="admin-section">

  <h2>
    📜 Moderation History
  </h2>

  <div className="letter-tabs admin-tabs">

  <button
    className={`letter-tab ${
      historyFilter === "all" ? "active" : ""
    }`}
    onClick={() => setHistoryFilter("all")}
  >
    📜 All
  </button>

  <button
    className={`letter-tab ${
      historyFilter === "warning" ? "active" : ""
    }`}
    onClick={() => setHistoryFilter("warning")}
  >
    ⚠️ Warnings
  </button>

  <button
    className={`letter-tab ${
      historyFilter === "suspended" ? "active" : ""
    }`}
    onClick={() => setHistoryFilter("suspended")}
  >
    ⏸ Suspensions
  </button>

  <button
    className={`letter-tab ${
      historyFilter === "banned" ? "active" : ""
    }`}
    onClick={() => setHistoryFilter("banned")}
  >
    🚫 Bans
  </button>

  <button
    className={`letter-tab ${
      historyFilter === "restored" ? "active" : ""
    }`}
    onClick={() => setHistoryFilter("restored")}
  >
    ♻️ Restored
  </button>

</div>

  <p className="moderation-history-description">
    A record of warnings, suspensions and bans.
  </p>


  {loadingModerationLogs && (
    <p className="empty-message">
      Loading moderation history...
    </p>
  )}


  {!loadingModerationLogs &&
    moderationLogs.length === 0 && (

    <div className="empty-message">

      <div className="empty-icon">
        📜
      </div>

      <h3>
        No moderation history
      </h3>

      <p>
        Moderation actions will appear here.
      </p>

    </div>
  )}


  <div className="moderation-history-list">

    {moderationLogs
        .filter((log) => {
          if (historyFilter === "all") {
            return true;
          }

          return log.action === historyFilter;
        })
        .map((log) => (

      <article
        className="moderation-history-card"
        key={log.id}
      >

        <div className="moderation-history-top">

          <div>

            <strong>
              {log.action === "warning" && "⚠️"}
              {log.action === "suspended" && "⏸️"}
              {log.action === "banned" && "🔨"}
              {log.action === "restored" && "✅"}
              {log.action === "warning_reset" && "🔄"}
              {" "}
              @{log.username || "Unknown"}
            </strong>

            <span
              className={`moderation-action moderation-action-${log.action}`}
            >
              {log.action}
            </span>

          </div>


          <span className="moderation-history-date">
            {formatModerationDate(log.createdAt)}
          </span>

        </div>


        <div className="moderation-history-info">

          <strong>
            Reason
          </strong>

          <p>
            {log.reason || "No reason provided"}
          </p>

        </div>


        {log.note && (

          <div className="moderation-history-info">

            <strong>
              Moderator note
            </strong>

            <p>
              {log.note}
            </p>

          </div>

        )}


        <div className="moderation-history-userid">
          User ID: {log.userId}
        </div>

        <div className="moderation-history-actions">

            <button
               className="delete-button"
               onClick={() =>
                 deleteModerationLog(log.id)
               }
           >
               🗑️ Delete History
            </button>

</div>

      </article>

    ))}

  </div>

</section>
)}

    {/* ======================================
        LETTER REPORTS
        ====================================== */}

<section className="admin-section">

  <h2>
    🚩💌 Letter Reports
  </h2>

  {loadingLetterReports && (
    <p className="empty-message">
      Loading letter reports...
    </p>
  )}

  {!loadingLetterReports &&
    pendingLetterReports.length === 0 && (

    <div className="empty-message">

      <div className="empty-icon">
        ✅
      </div>

      <h3>
        No pending letter reports
      </h3>

      <p>
        No reported letters need review.
      </p>

    </div>
  )}

  <div className="admin-post-list">

    {pendingLetterReports.map((report) => {

      const reportedLetter = findLetterById(report.letterId);

      return (

      <article
        className="admin-post report-card"
        key={report.id}
      >

        <div className="admin-post-top">

          <span>
            🚩 Letter Report
          </span>

          <span>
            Pending Review
          </span>

        </div>

        <div className="report-info">

          <strong>
            Sender
          </strong>

          <p>
            @{report.senderUsername || "Unknown"}
          </p>

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
              Reporter details
            </strong>

            <p>
              {report.details}
            </p>

          </div>
        )}

        <div className="reported-post-box">

          <strong>
            Letter ID
          </strong>

          <p>
            {report.letterId}
          </p>

        </div>

        <div className="admin-actions">

          <button
            className="approve-button"
            onClick={() =>
              dismissLetterReport(report.id)
            }
          >
            ✅ Dismiss
          </button>

          <button
            className="reject-button"
            onClick={() =>
              removeReportedLetter(report)
            }
          >
            🗑️ Remove Letter
          </button>

          <button
            className="delete-button"
            onClick={() => {
              const account = users.find(
                (userAccount) =>
                  userAccount.id === report.senderId
              );

              if (!account) {
                alert("Sender account not found.");
                return;
              }

              setModerationTarget(account);
              setModerationAction("warning");
            }}
          >
            ⚠️ Warn Sender
          </button>

          <button
            className="delete-button"
            onClick={() => {
              const account = users.find(
                (userAccount) =>
                  userAccount.id === report.senderId
              );

              if (!account) {
                alert("Sender account not found.");
                return;
              }

              setModerationTarget(account);
              setModerationAction("suspended");
            }}
          >
            ⏸️ Suspend Sender
          </button>

          <button
            className="reject-button"
            onClick={() => {
              const account = users.find(
                (userAccount) =>
                  userAccount.id === report.senderId
              );

              if (!account) {
                alert("Sender account not found.");
                return;
              }

              setModerationTarget(account);
              setModerationAction("banned");
            }}
          >
            🔨 Ban Sender
          </button>

        </div>

      </article>
     );
    })}

  </div>

</section>

{/* ======================================
    LETTER REPORTS
====================================== */}

{activeAdminTab === "letterReports" && (
<section className="admin-section">

  <h2>
    🚩💌 Letter Reports
  </h2>

  {loadingLetterReports && (
    <p className="empty-message">
      Loading letter reports...
    </p>
  )}

  {!loadingLetterReports &&
    pendingLetterReports.length === 0 && (

    <div className="empty-message">

      <div className="empty-icon">
        ✅
      </div>

      <h3>
        No pending letter reports
      </h3>

      <p>
        No reported letters need review.
      </p>

    </div>
  )}

  <div className="admin-post-list">

    {pendingLetterReports.map((report) => {
      const reportedLetter = findLetterById(report.letterId);

      return (
      <article
        className="admin-post report-card"
        key={report.id}
      >

        <div className="admin-post-top">

          <span>
            🚩 Letter Report
          </span>

          <span>
            Pending Review
          </span>

        </div>

        <div className="report-info">

          <strong>
            Sender
          </strong>

          <p>
            @{report.senderUsername || "Unknown"}
          </p>

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
              Reporter details
            </strong>

            <p>
              {report.details}
            </p>

          </div>
        )}

        <div className="reported-post-box">

          <strong>
            Reported Letter
          </strong>

          <div className="reported-post-box">

          <strong>
            Reported Letter
          </strong>

        {reportedLetter ? (
          <p>
            {reportedLetter.message}
          </p>
        ) : (
          <p>
            This letter has already been removed.
          </p>
        )}

      </div>

      </div>

        <div className="admin-actions">

          <button
            className="approve-button"
            onClick={() =>
              dismissLetterReport(report.id)
            }
          >
            ✅ Dismiss
          </button>

          <button
            className="reject-button"
            onClick={() =>
              removeReportedLetter(report)
            }
          >
            🗑️ Remove Letter
          </button>

          <button
            className="delete-button"
            onClick={() => {
              const account = users.find(
                (userAccount) =>
                  userAccount.id === report.senderId
              );

              if (!account) {
                alert("Sender account not found.");
                return;
              }

              setModerationTarget(account);
              setModerationAction("warning");
            }}
          >
            ⚠️ Warn Sender
          </button>

          <button
            className="delete-button"
            onClick={() => {
              const account = users.find(
                (userAccount) =>
                  userAccount.id === report.senderId
              );

              if (!account) {
                alert("Sender account not found.");
                return;
              }

              setModerationTarget(account);
              setModerationAction("suspended");
            }}
          >
            ⏸️ Suspend Sender
          </button>

          <button
            className="reject-button"
            onClick={() => {
              const account = users.find(
                (userAccount) =>
                  userAccount.id === report.senderId
              );

              if (!account) {
                alert("Sender account not found.");
                return;
              }

              setModerationTarget(account);
              setModerationAction("banned");
            }}
          >
            🔨 Ban Sender
          </button>

        </div>

      </article>
        );
    })}

  </div>

</section>
)}

    </main>
  );
}

export default Admin;