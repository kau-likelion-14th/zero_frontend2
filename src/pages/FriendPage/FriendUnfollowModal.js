import React, { useEffect } from "react";
import "../../styles/FriendUnfollowModal.css";

function FriendUnfollowModal({ isOpen, friend, onConfirm, onClose }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const displayName = friend?.name ?? "";
  const displayTag = friend?.tag ? `#${friend.tag}` : "";

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <div className="friend-unfollow-modal__overlay" onClick={handleOverlayClick}>
      <div
        className="friend-unfollow-modal__content"
        role="dialog"
        aria-modal="true"
      >
        <p className="friend-unfollow-modal__text">
          <span className="friend-unfollow-modal__name">{displayName}</span>{" "}
          <span className="friend-unfollow-modal__tag">{displayTag}</span>
          님을 팔로우 목록에서
          <br />
          삭제하시겠습니까?
        </p>

        <div className="friend-unfollow-modal__actions">
          <button
            type="button"
            className="friend-unfollow-modal__btn friend-unfollow-modal__btn--yes"
            onClick={onConfirm}
          >
            예
          </button>

          <button
            type="button"
            className="friend-unfollow-modal__btn friend-unfollow-modal__btn--no"
            onClick={onClose}
          >
            아니오
          </button>
        </div>
      </div>
    </div>
  );
}

export default FriendUnfollowModal;