import { useState } from "react";

import {
  addDoc,
  collection,
  serverTimestamp
} from "firebase/firestore";

import { db } from "../src/firebase";

function ReportLetterModal({
  letter,
  user,
  onClose
}) {
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
      await addDoc(
        collection(db, "letterReports"),
        {
          reporterId: user.uid,

          letterId: letter.id,

          senderId: letter.senderId,
          senderUsername:
            letter.senderUsername || "Unknown",

          receiverId: user.uid,

          reason: reason,
          details: details.trim(),

          status: "pending",

          createdAt: serverTimestamp()
        }
      );

      alert(
        "🚩 This letter has been reported to the moderation team."
      );

      onClose();

    } catch (error) {
      console.error(
        "LETTER REPORT ERROR:",
        error
      );

      console.error(
        "ERROR CODE:",
        error.code
      );

      setError(
        `Report error: ${error.code}`
      );
    }

    setSending(false);
  };

  return (
    <div className="modal-overlay">

      <div className="report-modal">

        <h2>
          🚩 Report Letter
        </h2>

        <p>
          Tell us why this care letter made you
          uncomfortable or violated the community rules.
        </p>


        <label>
          Reason
        </label>

        <select
          value={reason}
          onChange={(event) =>
            setReason(event.target.value)
          }
        >

          <option value="">
            Choose a reason
          </option>

          <option value="harassment">
            Harassment or bullying
          </option>

          <option value="hate">
            Hate or discrimination
          </option>

          <option value="threat">
            Threats or violence
          </option>

          <option value="sexual">
            Sexual or inappropriate content
          </option>

          <option value="spam">
            Spam or unwanted messages
          </option>

          <option value="manipulation">
            Manipulative or disturbing message
          </option>

          <option value="other">
            Other
          </option>

        </select>


        <label>
          Additional details (optional)
        </label>

        <textarea
          value={details}
          onChange={(event) =>
            setDetails(event.target.value)
          }
          placeholder="Tell the moderator what happened..."
          maxLength={500}
        />

        <div className="character-count">
          {details.length}/500
        </div>


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
            {sending
              ? "Sending..."
              : "🚩 Submit Report"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default ReportLetterModal;