import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where
} from "firebase/firestore";

import { db } from "./firebase";
import ReportModal from "./ReportModal";
import CareModal from "./CareModal";

function Community({ user, profile }) {
  const [thought, setThought] = useState("");
  const [posts, setPosts] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [reportingPost, setReportingPost] = useState(null);
  const [carePost, setCarePost] = useState(null);

  // Load posts
  useEffect(() => {
    const postsQuery = query(
      collection(db, "posts"),
      where("status", "==", "approved"),
    );

    const unsubscribe = onSnapshot(
      postsQuery,
      (snapshot) => {
        const postList = snapshot.docs.map((post) => ({
          id: post.id,
          ...post.data()
        }));

        setPosts(postList);
        setLoading(false);
      },
     (error) => {
        console.error("POST LOAD ERROR:", error); 
        console.error("ERROR CODE:", error.code);
        console.error("ERROR MESSAGE:", error.message);

    setError(
        `Community error: ${error.code} — ${error.message}`
    );
    
    setLoading(false);
}
    );

    return () => unsubscribe();
  }, []);

  // ==========================================
// LOAD BLOCKED USERS
// ==========================================

useEffect(() => {
  if (!user) {
    return;
  }

  const blocksQuery = query(
    collection(db, "blocks"),
    where("blockerId", "==", user.uid)
  );

  const unsubscribe = onSnapshot(
    blocksQuery,

    (snapshot) => {
      const blockedList = snapshot.docs.map(
        (blockDocument) =>
          blockDocument.data().blockedUserId
      );

      setBlockedUsers(blockedList);
    },

    (error) => {
      console.error(
        "BLOCK LIST ERROR:",
        error
      );
    }
  );

  return () => unsubscribe();

}, [user]);

  // Create post
  const handlePost = async () => {
    const cleanThought = thought.trim();

    if (!cleanThought) {
      setError("Please write something before posting.");
      return;
    }

    if (cleanThought.length < 3) {
      setError("Your thought is too short.");
      return;
    }

    if (cleanThought.length > 1000) {
      setError("Your thought cannot be longer than 1000 characters.");
      return;
    }

    setPosting(true);
    setError("");

    try {
      await addDoc(collection(db, "posts"), {
        authorId: user.uid,
        authorUsername: profile.username,

        content: cleanThought,

        anonymous: true,

        status: "pending",

        createdAt: serverTimestamp()
      });

      setThought("");

    } catch (error) {
  console.error("POST LOAD ERROR:", error);
  console.error("ERROR CODE:", error.code);
  console.error("ERROR MESSAGE:", error.message);

  setError(`Firebase error: ${error.code}`);
  setLoading(false);
}

    setPosting(false);
  };

  // ==========================================
// BLOCK / HIDE PERSON
// ==========================================

const handleBlock = async (post) => {

  if (post.authorId === user.uid) {
    return;
  }

  if (blockedUsers.includes(post.authorId)) {
    return;
  }

  const confirmed = window.confirm(
    "Hide posts from this person? You will no longer see their posts."
  );

  if (!confirmed) {
    return;
  }

  try {

    await addDoc(
      collection(db, "blocks"),
      {
        blockerId: user.uid,
        blockedUserId: post.authorId,
        createdAt: serverTimestamp()
      }
    );

  } catch (error) {

    console.error(
      "BLOCK ERROR:",
      error
    );

    setError(
      "We couldn't hide this person."
    );

  }
};

  // Delete your own post
  const handleDelete = async (post) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this thought?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteDoc(doc(db, "posts", post.id));
    } catch (error) {
      console.error("DELETE ERROR:", error);
      setError("We couldn't delete the post.");
    }
  };

  // Format timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) {
      return "Just now";
    }

    return timestamp.toDate().toLocaleString();
  };

  return (
    <main className="community">

      <section className="community-header">

        <h1>💭 Community</h1>

        <p>
          Share what's on your mind.
          Someone might understand.
        </p>

      </section>

      {/* CREATE POST */}

      <section className="thought-box">

        <h2>
          🌱 What is on your mind?
        </h2>

        <textarea
          value={thought}
          onChange={(event) => setThought(event.target.value)}
          placeholder="Write whatever is on your mind..."
          maxLength={1000}
        />

        <div className="character-count">
          {thought.length}/1000
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <div className="thought-footer">

          <span>
            🌱 Be kind. Be respectful.
          </span>

          <button
            onClick={handlePost}
            disabled={posting}
          >
            {posting ? "Posting..." : "Post Anonymously"}
          </button>

        </div>

      </section>

      {/* COMMUNITY POSTS */}

      <section className="posts-section">

        <h2>
          🌙 What people are sharing
        </h2>

        {loading && (
          <p className="empty-message">
            Loading thoughts...
          </p>
        )}

        {!loading && posts.length === 0 && (
          <div className="empty-message">
            <div className="empty-icon">🌱</div>

            <h3>
              It's quiet here...
            </h3>

            <p>
              Be the first person to share something.
            </p>
          </div>
        )}

        <div className="posts-list">

          {posts
          .filter(
            (post) => 
                !blockedUsers.includes(post.authorId)
        )
        .map((post) => (

            <article
              className="post-card"
              key={post.id}
            >

              <div className="post-header">

                <div className="anonymous-user">
                  🌙 Anonymous
                </div>

                <div className="post-date">
                  {formatDate(post.createdAt)}
                </div>

              </div>

              <p className="post-content">
                {post.content}
              </p>

              <div className="post-actions">

                {post.authorId !== user.uid && (
                    <button
                    onClick={() => setCarePost(post)}
                    >
                    ❤️ Send Care
                    </button>
                )}

               <button
                 onClick={() => setReportingPost(post)}
                 >
                    🚩 Report
                    </button>

                {post.authorId !== user.uid && (
                    <button
                    onClick={() => handleBlock(post)}
                    >
                    🚫 Hide Person
                    </button>
                )}

                {post.authorId === user.uid && (
                  <button
                    onClick={() => handleDelete(post)}
                  >
                    🗑️ Delete
                  </button>
                )}

              </div>

            </article>

          ))}

        </div>

      </section>

{reportingPost && (
  <ReportModal
    post={reportingPost}
    user={user}
    onClose={() => setReportingPost(null)}
  />
)}

{/* CARE LETTER POPUP */}

{carePost && (
  <CareModal
    post={carePost}
    user={user}
    profile={profile}
    onClose={() => setCarePost(null)}
  />
)}

    </main>
  );
}

export default Community;