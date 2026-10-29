import React, { useEffect } from "react";
import "../../styles/FriendUnfollowModal.css";

// 친구 언팔할 때 진짜 삭제할지 묻는 확인 모달
function FriendUnfollowModal({ 
  isOpen,     // 부모가 true 주면 뜨고, false 주면 사라짐
  friend,     // 삭제할 친구 정보 (모달 안에 이름/태그 보여주려고)
  onConfirm,  // "예" 누르면 실행 - 부모가 실제 삭제 처리
  onClose     // "아니오"나 ESC 누르면 실행 - 부모가 isOpen을 false로 바꿈
}) {

  // ESC 키 누르면 닫히게
  // 모달 열렸을 때만 이벤트 등록, 닫히면 해제 (안 그러면 메모리 누수)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // 닫혀있으면 아예 렌더링 X (return null이라 DOM에 안 그려짐)
  if (!isOpen) return null;

  const displayName = friend?.name ?? "";
  const displayTag = friend?.tag ? `#${friend.tag}` : "";

  // 어두운 배경 클릭하면 닫기 (단, 모달 내용 클릭은 안 닫힘)
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <div className="friend-unfollow-modal__overlay" onClick={handleOverlayClick}>
      <div className="friend-unfollow-modal__content" role="dialog" aria-modal="true">
        <p className="friend-unfollow-modal__text">
          <span className="friend-unfollow-modal__name">{displayName}</span>{" "}
          <span className="friend-unfollow-modal__tag">{displayTag}</span>
          님을 팔로우 목록에서
          <br />
          삭제하시겠습니까?
        </p>

        <div className="friend-unfollow-modal__actions">
          {/* "예" → onConfirm 실행 → 부모에서 friends 배열에서 빼버림 → 리스트 다시 그려짐 */}
          <button
            type="button"
            className="friend-unfollow-modal__btn friend-unfollow-modal__btn--yes"
            onClick={onConfirm}
          >
            예
          </button>

          {/* "아니오" → onClose 실행 → isOpen false → 모달 사라짐 */}
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