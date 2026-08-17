import { useEffect, useState } from "react";

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where
} from "firebase/firestore";

import { db } from "./firebase";
import ReplyModal from "./ReplyModal";

function Letters({ user, profile }) {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyLetter, setReplyLetter] = useState(null);

  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(true);
  const [letterTab, setLetterTab] = useState("letters");

  const [openedLetterId, setOpenedLetterId] = useState(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    const lettersQuery = query(
      collection(db, "letters"),
      where("receiverId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      lettersQuery,

      (snapshot) => {
        const letterList = snapshot.docs
          .map((letter) => ({
            id: letter.id,
            ...letter.data()
          }))
          .sort((a, b) => {
            const aTime =
              a.createdAt?.toMillis?.() || 0;

            const bTime =
              b.createdAt?.toMillis?.() || 0;

            return bTime - aTime;
          });

        setLetters(letterList);
        setLoading(false);
      },

      (error) => {
        console.error(
          "LETTER LOAD ERROR:",
          error
        );

        setError(
          `Letter error: ${error.code}`
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();

  }, [user]);

  // ==========================================
// LOAD REPLIES RECEIVED
// ==========================================

useEffect(() => {
  if (!user) {
    return;
  }

  const repliesQuery = query(
    collection(db, "letterReplies"),
    where("receiverId", "==", user.uid)
  );

  const unsubscribe = onSnapshot(
    repliesQuery,

    (snapshot) => {
      const replyList = snapshot.docs
        .map((reply) => ({
          id: reply.id,
          ...reply.data()
        }))
        .sort((a, b) => {
          const aTime =
            a.createdAt?.toMillis?.() || 0;

          const bTime =
            b.createdAt?.toMillis?.() || 0;

          return bTime - aTime;
        });

      setReplies(replyList);
      setLoadingReplies(false);
    },

    (error) => {
      console.error(
        "REPLY LOAD ERROR:",
        error
      );

      setError(
        `Reply error: ${error.code}`
      );

      setLoadingReplies(false);
    }
  );

  return () => unsubscribe();

}, [user]);

  const deleteLetter = async (letterId) => {
    const confirmed = window.confirm(
      "Delete this letter?"
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

      setError(
        "We couldn't delete this letter."
      );
    }
  };


  const formatDate = (timestamp) => {
    if (!timestamp) {
      return "Just now";
    }

    return timestamp
      .toDate()
      .toLocaleString();
  };


  return (
    <main className="letters-page">

      <section className="letters-header">

        <div className="letters-icon">
          💌
        </div>

        <h1>My Letters</h1>

        <p>
          Little messages of care sent to you.
        </p>

      </section>

      <div className="letter-tabs">

  <button
    className={
      letterTab === "letters"
        ? "letter-tab active"
        : "letter-tab"
    }
    onClick={() =>
      setLetterTab("letters")
    }
  >
    💌 Care Received

    {letters.length > 0 && (
      <span className="letter-tab-count">
        {letters.length}
      </span>
    )}
  </button>


  <button
    className={
      letterTab === "replies"
        ? "letter-tab active"
        : "letter-tab"
    }
    onClick={() =>
      setLetterTab("replies")
    }
  >
    💬 Replies Received

    {replies.length > 0 && (
      <span className="letter-tab-count">
        {replies.length}
      </span>
    )}
  </button>

</div>


      {error && (
        <div className="auth-error">
          {error}
        </div>
      )}


      {loading && (
        <div className="empty-message">
          Loading your letters...
        </div>
      )}


      {!loading &&
        letters.length === 0 && (

        <div className="empty-message">

          <div className="empty-icon">
            💌
          </div>

          <h3>
            No letters yet
          </h3>

          <p>
            When someone sends you a little care,
            it will appear here.
          </p>

        </div>
      )}


      {letterTab === "letters" && (
        <div className="letters-list">

        {letters.map((letter) => (

          <article
            className="letter-card"
            key={letter.id}
          >

            <div className="letter-top">

              <span>
                💌 @{letter.senderUsername || "Someone"} sent you care
              </span>

              <span className="letter-date">
                {formatDate(letter.createdAt)}
              </span>

            </div>


            <div
              className={`letter-paper ${
                openedLetterId === letter.id ? "opened" : "closed"
              }`}
              onClick={() =>
                setOpenedLetterId(
                   openedLetterId === letter.id ? null : letter.id
                )
              }
            >
              {openedLetterId === letter.id ? (
                <>
                   <p>{letter.message}</p>
                   <span className="letter-hint">Tap to close</span>
                </>
              ) : (
               <div className="closed-letter">
               <div className="envelope-icon">✉️</div>
               <span className="letter-hint">Tap the letter to open</span>
             </div>
         )}
       </div>


            <div className="letter-footer">

              <span>
                🌙 From @{letter.senderUsername || "Someone"}
              </span>

              <div style={{ display: "flex", gap: "8px" }}></div>

               <button
                 onClick={() =>
                   setReplyLetter(letter)
                 }
               >
                📩 Reply
               </button>

              <button
                onClick={() =>
                  deleteLetter(letter.id)
                }
              >
                🗑️ Delete
              </button>

            </div>

          </article>

        ))}

      </div>
    )}

    {/* ======================================
    REPLIES RECEIVED
====================================== */}

{letterTab === "replies" && (

  <div className="letters-list">

    {loadingReplies && (
      <div className="empty-message">
        Loading your replies...
      </div>
    )}


    {!loadingReplies &&
      replies.length === 0 && (

      <div className="empty-message">

        <div className="empty-icon">
          💬
        </div>

        <h3>No replies yet</h3>

        <p>
          When someone replies to a care
          message you sent, it will appear here.
        </p>

      </div>
    )}


    {replies.map((reply) => (

      <article
        className="letter-card reply-card"
        key={reply.id}
      >

        <div className="letter-top">

          <span>
            💬 @{reply.senderUsername || "Someone"}
            {" "}replied to you
          </span>

          <span className="letter-date">
            {formatDate(reply.createdAt)}
          </span>

        </div>


        <div className="reply-message-box">

          <div className="reply-quote">
            💬
          </div>

          <p>
            {reply.message}
          </p>

        </div>


        <div className="letter-footer">

          <span>
            🌱 Reply from @{reply.senderUsername || "Someone"}
          </span>

        </div>

      </article>

    ))}

  </div>

)}

      {replyLetter && (
         <ReplyModal
           letter={replyLetter}
           user={user}
           profile={profile}
           onClose={() =>
             setReplyLetter(null)
         }
       />
       )}

    </main>
  );
}

export default Letters;