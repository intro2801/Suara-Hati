import { useState } from "react";
import {
  addDoc,
  collection,
  serverTimestamp
} from "firebase/firestore";

import { db } from "./firebase";

function ReportModal({ post, user, onClose }) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleReport = async () => {
    if (!reason) {
      setError("Please choose a reason.");
      return;
    }

    setSending(true);
    setError("");

    try {
      await addDoc(collection(db, "reports"), {
        reporterId: user.uid,
        postId: post.id,
        postAuthorId: post.authorId,
        reason,
        details: details.trim(),
        status: "pending",
        createdAt: serverTimestamp()
      });

      alert("Thank you. Your report has been sent for review.");
      onClose();

    } catch (error) {
      console.error("REPORT ERROR:", error);
      setError("We couldn't submit your report.");
    }

    setSending(false);
  };

  return (
    <div className="modal-overlay">

      <div className="report-modal">

        <h2>🚩 Report this post</h2>

        <p>
          Help us keep Suara Hati safe.
        </p>

        <label>Why are you reporting this?</label>

        <select
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        >
          <option value="">Choose a reason</option>
          <option value="harassment">Harassment or bullying</option>
          <option value="hate">Hate or discrimination</option>
          <option value="threat">Threats or violence</option>
          <option value="sexual">Sexual content</option>
          <option value="spam">Spam</option>
          <option value="self-harm">Self-harm concern</option>
          <option value="other">Other</option>
        </select>

        <label>More information (optional)</label>

        <textarea
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          placeholder="Tell us anything else we should know..."
          maxLength={500}
        />

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <div className="modal-actions">

          <button
            className="cancel-button"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="report-submit-button"
            onClick={handleReport}
            disabled={sending}
          >
            {sending ? "Sending..." : "Submit Report"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default ReportModal;