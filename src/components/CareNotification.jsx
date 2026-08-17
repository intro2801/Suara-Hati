import "./CareNotification.css";
import { useEffect, useRef, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";

import { db } from "../firebase";

function CareNotification({ user, onView }) {
  const [toasts, setToasts] = useState([]);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (!user) return;

    const lettersQuery = query(
      collection(db, "letters"),
      where("receiverId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      lettersQuery,
      (snapshot) => {
        // Skip the first load so old letters don't trigger a popup
        if (isFirstLoad.current) {
          isFirstLoad.current = false;
          return;
        }

        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const letter = { id: change.doc.id, ...change.doc.data() };
            const toastId = letter.id + "-" + Date.now();

            setToasts((prev) => [
              ...prev,
              {
                toastId,
                sender: letter.senderUsername || "Someone",
                message: letter.message || "",
              },
            ]);

            setTimeout(() => {
              setToasts((prev) => prev.filter((t) => t.toastId !== toastId));
            }, 7000);
          }
        });
      },
      (err) => {
        console.error("CARE NOTIFICATION ERROR:", err.code, err.message);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const dismiss = (toastId) => {
    setToasts((prev) => prev.filter((t) => t.toastId !== toastId));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="care-toast-stack">
      {toasts.map((toast) => (
        <div className="care-toast" key={toast.toastId}>
          <div className="care-toast-seal">💌</div>

          <div className="care-toast-body">
            <strong>@{toast.sender} sent you care</strong>
            <p>{toast.message}</p>

            <button
              className="care-toast-view"
              onClick={() => {
                dismiss(toast.toastId);
                onView?.();
              }}
            >
              View letter
            </button>
          </div>

          <button
            className="care-toast-close"
            onClick={() => dismiss(toast.toastId)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export default CareNotification;