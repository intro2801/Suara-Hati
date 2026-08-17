import "./Modals.css";
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { db } from "../../firebase";

function CareModal({ post, user, profile, onClose }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSendCare = async () => {
    const cleanMessage = message.trim();

    if (!cleanMessage) {
      setError("Please write something first.");
      return;
    }

    if (cleanMessage.length < 3) {
      setError("Your letter is too short.");
      return;
    }

    if (cleanMessage.length > 500) {
      setError("Your letter cannot be longer than 500 characters.");
      return;
    }

    if (post.authorId === user.uid) {
      setError("You cannot send a care letter to yourself.");
      return;
    }

    setSending(true);
    setError("");

    try {
      await addDoc(collection(db, "letters"), {
        senderId: user.uid,
        senderUsername: profile.username,
        receiverId: post.authorId,
        postId: post.id,
        message: cleanMessage,
        status: "sent",
        createdAt: serverTimestamp(),
      });

      alert("💌 Your care letter has been sent.");
      onClose();
    } catch (err) {
      console.error("LETTER ERROR:", err.code, err.message);
      setError("We couldn't send your letter.");
    }

    setSending(false);
  };

  return (
    <div className="modal-overlay">
      <div className="report-modal">
        <h2>💌 Send a Little Care</h2>
        <p>Send a kind message to the person who shared this thought.</p>

        <label>Your letter</label>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="I hope tomorrow feels a little easier for you..."
          maxLength={500}
        />

        <div className="character-count">{message.length}/500</div>

        {error && <div className="auth-error">{error}</div>}

        <div className="modal-actions">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button className="report-submit-button" onClick={handleSendCare} disabled={sending}>
            {sending ? "Sending..." : "💌 Send Letter"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CareModal;