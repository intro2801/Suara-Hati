import "./Modals.css";
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { db } from "../../firebase";

function ReplyModal({ letter, user, profile, onClose }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleReply = async () => {
    const cleanMessage = message.trim();

    if (!cleanMessage) {
      setError("Please write a reply first.");
      return;
    }

    if (cleanMessage.length < 2) {
      setError("Your reply is too short.");
      return;
    }

    if (cleanMessage.length > 500) {
      setError("Your reply cannot be longer than 500 characters.");
      return;
    }

    setSending(true);
    setError("");

    try {
      await addDoc(collection(db, "letterReplies"), {
        letterId: letter.id,
        senderId: user.uid,
        senderUsername: profile.username,
        receiverId: letter.senderId,
        message: cleanMessage,
        createdAt: serverTimestamp(),
      });

      alert("💬 Your reply has been sent.");
      onClose();
    } catch (err) {
      console.error("REPLY ERROR:", err.code, err.message);
      setError("We couldn't send your reply.");
    }

    setSending(false);
  };

  return (
    <div className="modal-overlay">
      <div className="report-modal">
        <h2>💬 Reply to @{letter.senderUsername}</h2>
        <p>Send a kind reply to this care letter.</p>

        <label>Your reply</label>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Thank you. I really needed this today..."
          maxLength={500}
        />

        <div className="character-count">{message.length}/500</div>

        {error && <div className="auth-error">{error}</div>}

        <div className="modal-actions">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button className="report-submit-button" onClick={handleReply} disabled={sending}>
            {sending ? "Sending..." : "💬 Send Reply"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReplyModal;