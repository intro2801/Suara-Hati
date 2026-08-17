import "./Community.css";
import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "../firebase";
import ReportModal from "./modals/ReportModal";
import CareModal from "./modals/CareModal";

function Community({ user, profile }) {
  const [thought, setThought] = useState("");
  const [posts, setPosts] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [reportingPost, setReportingPost] = useState(null);
  const [carePost, setCarePost] = useState(null);

  useEffect(() => {
    const postsQuery = query(
      collection(db, "posts"),
      where("status", "==", "approved")
    );

    const unsubscribe = onSnapshot(
      postsQuery,
      (snapshot) => {
        const postList = snapshot.docs.map((post) => ({
          id: post.id,
          ...post.data(),
        }));

        setPosts(postList);
        setLoading(false);
      },
      (err) => {
        console.error("POST LOAD ERROR:", err.code, err.message);
        setError("Community error: " + err.code + " - " + err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const blocksQuery = query(
      collection(db, "blocks"),
      where("blockerId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      blocksQuery,
      (snapshot) => {
        const blockedList = snapshot.docs.map(
          (blockDoc) => blockDoc.data().blockedUserId
        );
        setBlockedUsers(blockedList);
      },
      (err) => {
        console.error("BLOCK LIST ERROR:", err.code, err.message);
      }
    );

    return () => unsubscribe();
  }, [user]);

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
        createdAt: serverTimestamp(),
      });

      setThought("");
    } catch (err) {
      console.error("POST CREATE ERROR:", err.code, err.message);
      setError("Firebase error: " + err.code);
    }

    setPosting(false);
  };

  const handleBlock = async (post) => {
    if (post.authorId === user.uid) return;
    if (blockedUsers.includes(post.authorId)) return;

    const confirmed = window.confirm(
      "Hide posts from this person? You will no longer see their posts."
    );

    if (!confirmed) return;

    try {
      await addDoc(collection(db, "blocks"), {
        blockerId: user.uid,
        blockedUserId: post.authorId,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("BLOCK ERROR:", err.code, err.message);
      setError("We couldn't hide this person.");
    }
  };

  const handleDelete = async (post) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this thought?"
    );

    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "posts", post.id));
    } catch (err) {
      console.error("DELETE ERROR:", err.code, err.message);
      setError("We couldn't delete the post.");
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Just now";
    return timestamp.toDate().toLocaleString();
  };

  const visiblePosts = posts.filter(
    (post) => !blockedUsers.includes(post.authorId)
  );

  return (
    <main className="community">
      <section className="community-header">
        <h1>Community</h1>
        <p>Share what is on your mind. Someone might understand.</p>
      </section>

      <div className="crisis-banner">
        <span className="crisis-banner-icon">🤍</span>
        <div className="crisis-banner-text">
          <strong>You are not alone.</strong>
          <span>
            Suara Hati is a space to share, but it isn't a substitute for
            professional help. If you're in crisis, reach out to{" "}
            <a href="tel:15999">Talian Kasih (15999)</a>{" "}
            or{" "}
            <a href="https://www.befrienders.org.my" target="_blank" rel="noopener noreferrer">Befrienders</a>
            {" "}— someone is ready to listen, any time.
          </span>
        </div>
      </div>

      <section className="thought-box">
        <h2>What is on your mind?</h2>

        <textarea
          value={thought}
          onChange={(event) => setThought(event.target.value)}
          placeholder="Write whatever is on your mind..."
          maxLength={1000}
        />

        <div className="character-count">{thought.length}/1000</div>

        {error && <div className="auth-error">{error}</div>}

        <div className="thought-footer">
          <span>Be kind. Be respectful.</span>

          <button onClick={handlePost} disabled={posting}>
            {posting ? "Posting..." : "Post Anonymously"}
          </button>
        </div>
      </section>

      <section className="posts-section">
        <h2>What people are sharing</h2>

        {loading && <p className="empty-message">Loading thoughts...</p>}

        {!loading && visiblePosts.length === 0 && (
          <div className="empty-message">
            <div className="empty-icon">🌱</div>
            <h3>It's quiet here...</h3>
            <p>Be the first person to share something.</p>
          </div>
        )}

        <div className="posts-list">
          {visiblePosts.map((post) => (
            <article className="post-card" key={post.id}>
              <div className="post-header">
                <div className="anonymous-user">Anonymous</div>
                <div className="post-date">{formatDate(post.createdAt)}</div>
              </div>

              <p className="post-content">{post.content}</p>

              <div className="post-actions">
                {post.authorId !== user.uid && (
                  <button onClick={() => setCarePost(post)}>Send Care</button>
                )}

                <button onClick={() => setReportingPost(post)}>Report</button>

                {post.authorId !== user.uid && (
                  <button onClick={() => handleBlock(post)}>Hide Person</button>
                )}

                {post.authorId === user.uid && (
                  <button onClick={() => handleDelete(post)}>Delete</button>
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