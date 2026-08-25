import { useState } from "react";

function ModerationModal({
  account,
  action,
  onClose,
  onConfirm
}) {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!reason) {
      setError("Please choose a reason.");
      return;
    }

    onConfirm({
      reason,
      note: note.trim()
    });
  };

  const actionTitle =
    action === "warning"
      ? "⚠️ Warn User"
      : action === "suspended"
      ? "⏸️ Suspend User"
      : action === "banned"
      ? "🔨 Ban User"
      : "Moderation Action";

  return (
    <div className="modal-overlay">

      <div className="report-modal">

        <h2>{actionTitle}</h2>

        <p>
          Taking action against
          {" "}
          <strong>
            @{account.username || "Unknown"}
          </strong>
        </p>

        <label>Reason</label>

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
            Sexual content
          </option>

          <option value="spam">
            Spam or repeated unwanted content
          </option>

          <option value="abuse">
            Abuse of Suara Hati features
          </option>

          <option value="other">
            Other
          </option>
        </select>

        <label>
          Moderator note (optional)
        </label>

        <textarea
          value={note}
          onChange={(event) =>
            setNote(event.target.value)
          }
          placeholder="Add details about why this action was taken..."
          maxLength={500}
        />

        <div className="character-count">
          {note.length}/500
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
            onClick={handleSubmit}
          >
            Confirm Action
          </button>

        </div>

      </div>

    </div>
  );
}

export default ModerationModal;