import { useEffect, useState } from "react";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  where
} from "firebase/firestore";

import { db } from "../src/firebase";

import ReplyModal from "../modals/ReplyModal";
import ReportLetterModal from "../modals/ReportLetterModal";

import letterClosed from "../assets/letter-closed.png";
import letterOpen from "../assets/letter-open.png";

import closedEnvelope from "../assets/letter-closed.png";
import openEnvelope from "../assets/letter-open.png";

function Letters({ user, profile, onLetterRead }) {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyLetter, setReplyLetter] = useState(null);
  const [reportLetter, setReportLetter] = useState(null);

  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(true);
  const [letterTab, setLetterTab] = useState("letters");

  const [openedLetterId, setOpenedLetterId] = useState(null);
  const [expandedLetterId, setExpandedLetterId] = useState(null);
  const [readLetterIds, setReadLetterIds] = useState(() => {
  try {
    return JSON.parse(
      localStorage.getItem("suaraHatiReadLetters") || "[]"
    );
  } catch {
    return [];
  }
});

  const [blockedUsers, setBlockedUsers] = useState([]);
  const [blockRecords, setBlockRecords] = useState([]);
  const [blockedUserProfiles, setBlockedUserProfiles] = useState({});

  useEffect(() => {
    if (!user) {
      return;
    }

    const lettersQuery = query(
      collection(db, "letters"),
      where("receiverId", "==", user.uid),
      where("status", "==", "approved")
    );

    const unsubscribe = onSnapshot(
      lettersQuery,

      (snapshot) => {
        const letterList = snapshot.docs
          .map((letter) => ({
            id: letter.id,
            ...letter.data()
          }))
           .filter(
             (letter) =>
               !blockedUsers.includes(letter.senderId)
          )
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

  }, [user, blockedUsers]);

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
    const records = snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data()
    }));

    const blockedIds = records.map(
      (record) => record.blockedUserId
    );

    console.log("BLOCKED USERS:", blockedIds);

    setBlockRecords(records);
    setBlockedUsers(blockedIds);
  },
    (error) => {
      console.error("BLOCK LOAD ERROR:", error);
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
         where("receiverId", "==", user.uid),
         where("status", "==", "approved")
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

  const blockLetterSender = async (letter) => {
  if (!letter.senderId) {
    return;
  }

  if (blockedUsers.includes(letter.senderId)) {
  alert(
    `@${letter.senderUsername || "This user"} is already blocked.`
  );
  return;
}

  const confirmed = window.confirm(
    `Block @${letter.senderUsername || "this person"}?`
  );

  if (!confirmed) {
    return;
  }

  try {
    const blockId = `${user.uid}_${letter.senderId}`;

      await setDoc(
           doc(db, "blocks", blockId),
         {
           blockerId: user.uid,
           blockedUserId: letter.senderId,
           blockedUsername: letter.senderUsername || "Unknown user",
           createdAt: new Date()
        }
    );

    alert(
      `@${letter.senderUsername || "This person"} has been blocked.`
    );

  } catch (error) {
    console.error(
      "BLOCK LETTER SENDER ERROR:",
      error
    );

    setError(
      "We couldn't block this person."
    );
  }
};

    const unblockUser = async (block) => {
    const confirmed = window.confirm(
      `Unblock @${block.blockedUsername ||
       blockedUserProfiles[block.blockedUserId]?.username ||
      "this user"}?`
    );

  if (!confirmed) {
    return;
  }

  try {
    await deleteDoc(
      doc(db, "blocks", block.id)
    );

    alert(
      `@${block.blockedUsername ||
        blockedUserProfiles[block.blockedUserId]?.username ||
        "This user"} has been unblocked.`
    );
  } catch (error) {
    console.error(
      "UNBLOCK USER ERROR:",
      error
    );

    setError(
      "We couldn't unblock this person."
    );
  }
};

    const markLetterAsRead = (letterId) => {
      setReadLetterIds((previous) => {
        if (previous.includes(letterId)) {
          return previous;
    }

    const updated = [...previous, letterId];

    localStorage.setItem(
      "suaraHatiReadLetters",
      JSON.stringify(updated)
    );

    if (onLetterRead) {
      onLetterRead(letterId);
    }

    return updated;
  });
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

  <button
     className={
       letterTab === "blocked"
         ? "letter-tab active"
         : "letter-tab"
     }
    onClick={() =>
      setLetterTab("blocked")
     }
  >
  🚫 Blocked Users

  {blockRecords.length > 0 && (
    <span className="letter-tab-count">
      {blockRecords.length}
    </span>
  )}
</button>

</div>


      {error && (
        <div className="auth-error">
          {error}
        </div>
      )}


      {letterTab === "letters" && loading && (
        <div className="empty-message">
          Loading your letters...
        </div>
      )}


      {letterTab === "letters" && 
        !loading && 
        letters.length === 0 && (

        <div className="letters-empty-state">

          <div className="letters-empty-icon">
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
          <div className="letter-card-envelope">
            <img
            src={closedEnvelope}
            alt="Closed envelope"
            />
            </div>

            <div className="letter-top">
              <span>
                💌 @{letter.senderUsername || "Someone"} sent you a Letter
              </span>

              {!readLetterIds.includes(letter.id) && (
                <span className="letter-new-badge">
                  NEW
                </span>
              )}
              
              <span className="letter-date">
                {formatDate(letter.createdAt)}
              </span>

            </div>


            <div
              className={`letter-paper ${
                openedLetterId === letter.id ? "opened" : "closed"
              }`}
              onClick={() => {
                 if (openedLetterId === letter.id) {
                   setOpenedLetterId(null);
                   setExpandedLetterId(null);
                 } else {
                   setOpenedLetterId(letter.id);
                   setExpandedLetterId(null);
                   markLetterAsRead(letter.id);
                 }
               }}
            >
              {openedLetterId === letter.id ? (
                <div className="opened-letter">
                  <div className="letter-open-stage">

                    <img
                      src={letterOpen}
                      alt="Opened letter"
                      className="letter-envelope-image open-envelope-image"
                   />

                  <div
                      className={`letter-message-overlay ${
                        expandedLetterId === letter.id ? "expanded" : "preview"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();

                        setExpandedLetterId(
                          expandedLetterId === letter.id ? null : letter.id
                        );
                      }}
                    >
                     <div className="paper-click-area">
                       {expandedLetterId === letter.id ? (
                         <p>{letter.message}</p>
                       ) : (
                        <p>
                          {letter.message.length > 22
                             ? `${letter.message.slice(0, 22)}...`
                             : letter.message}
                        </p>
                      )}
                     </div>
                </div>

            </div>

            <span className="letter-hint">
                {expandedLetterId === letter.id
                  ? "Tap the paper to put it back"
                  : "Tap the paper to read the full letter"}
            </span>
          </div>
        ) : (
          <div className="closed-letter">
            <img
             src={letterClosed}
             alt="Closed letter"
             className="letter-envelope-image"
          />

          <span className="letter-hint">
            Tap the letter to open
          </span>
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
                   setReportLetter(letter)
                 }
               >
                 🚩 Report
               </button>

               <button
                 onClick={() =>
                   blockLetterSender(letter)
                 }
               >
                 🚫 Block Sender
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

  {/* ========================================
      BLOCKED USERS
      ======================================== */}

    {letterTab === "blocked" && (
       <div className="letters-list">

    {blockRecords.length === 0 ? (
      <div className="empty-message">
        <div>🚫</div>

        <h3>No blocked users</h3>

        <p>
          People you block will appear here.
        </p>
      </div>
    ) : (
      blockRecords.map((block) => (
        <article
          key={block.id}
          className="letter-card"
        >
          <div>
            <strong>
              @{block.blockedUsername || "Unknown user"}
            </strong>

            <p>
              This user is currently blocked.
            </p>
          </div>

          <button
            onClick={() => unblockUser(block)}
          >
            Unblock
          </button>
        </article>
      ))
    )}

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

       {reportLetter && (
         <ReportLetterModal
           letter={reportLetter}
           user={user}
           onClose={() =>
             setReportLetter(null)
         }
       />
       )}

    </main>
  );
}

export default Letters;