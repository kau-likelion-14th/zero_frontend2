import { useEffect, useRef } from "react";
import { getCategories } from "./todoApi";
import useTodoResource from "./useTodoResource";
import TodoResourceStatus from "./TodoResourceStatus";

export default function TodoModal({ onClose }) {
  const dialogRef = useRef(null);
  const categories = useTodoResource(getCategories, "categories");

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  function closeDialog() {
    dialogRef.current.close();
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      className="modal-container todo-category-dialog"
      aria-labelledby="todo-modal-title"
      onCancel={(event) => {
        event.preventDefault();
        closeDialog();
      }}
    >
      <h2 className="modal-title" id="todo-modal-title">할 일 카테고리</h2>
      <div className="modal-section">
        <TodoResourceStatus resource={categories} label="카테고리를" />
        {categories.data?.length === 0 && <p>등록된 카테고리가 없습니다.</p>}
        {categories.data?.length > 0 && (
          <ul className="modal-categories todo-category-options">
            {categories.data.map(({ categoryId, categoryName }) => (
              <li key={categoryId} className="modal-categoryitem">{categoryName}</li>
            ))}
          </ul>
        )}
        <p className="todo-category-note">테스트용 할 일은 Swagger에서 등록할 수 있습니다.</p>
      </div>
      <div className="modal-actions">
        <button type="button" className="rightbutton" onClick={closeDialog}>닫기</button>
      </div>
    </dialog>
  );
}
