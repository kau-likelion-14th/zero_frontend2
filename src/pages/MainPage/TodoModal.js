import { useEffect, useRef, useState } from "react";
import { getCategories } from "./todoApi";
import useTodoResource from "./useTodoResource";
import TodoResourceStatus from "./TodoResourceStatus";

export default function TodoModal({ todo, onClose }) {
  const dialogRef = useRef(null);
  const categories = useTodoResource(getCategories, "categories");
  const [categoryId, setCategoryId] = useState(null);
  const initialCategory = todo
    ? categories.data?.find(({ categoryName }) => categoryName === todo.categoryName)
    : categories.data?.[0];
  const selectedId = categoryId ?? initialCategory?.categoryId;

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
      <h2 className="modal-title" id="todo-modal-title">
        {todo ? "할 일 보기" : "할 일 카테고리"}
      </h2>
      <div className="modal-section">
        <div className="modal-label" id="todo-category-label">카테고리</div>
        <TodoResourceStatus resource={categories} label="카테고리를" />
        {categories.data?.length === 0 && <p>등록된 카테고리가 없습니다.</p>}
        {categories.data?.length > 0 && (
          <div className="modal-categories todo-category-options" role="radiogroup" aria-labelledby="todo-category-label">
            {categories.data.map(({ categoryId, categoryName }) => (
              <label key={categoryId} className="modal-categoryitem">
                <span>{categoryName}</span>
                <input
                  type="radio"
                  name="todo-category"
                  checked={selectedId === categoryId}
                  onChange={() => setCategoryId(categoryId)}
                />
              </label>
            ))}
          </div>
        )}
      </div>
      {todo && (
        <div className="modal-section">
          <div className="modal-label">내용</div>
          <p className="input-wrapper todo-description-preview">{todo.description}</p>
        </div>
      )}
      <p className="todo-category-note">카테고리 선택은 미리보기입니다.</p>
      <div className="modal-actions">
        <button type="button" className="rightbutton" onClick={closeDialog}>닫기</button>
      </div>
    </dialog>
  );
}
