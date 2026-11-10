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
      <div className="todo-modal-header">
        <h2 className="modal-title" id="todo-modal-title">
          {todo ? "할 일 수정하기" : "할 일 추가하기"}
        </h2>
        <button type="button" className="todo-modal-close" aria-label="닫기" onClick={closeDialog}>
          ×
        </button>
      </div>
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
      <div className="modal-section">
        <label className="modal-label" htmlFor="todo-description">내용</label>
        <div className="input-wrapper">
          <input
            id="todo-description"
            className="text-input"
            type="text"
            placeholder="내용을 입력해주세요"
            defaultValue={todo?.description ?? ""}
          />
        </div>
      </div>
      <button type="button" className="routine-row" disabled>
        <span className="routine-label">루틴 등록하기</span>
        <span className="routine-button" aria-hidden="true">›</span>
      </button>
      <div className="modal-actions">
        <button type="button" className="leftbutton disabled" disabled>삭제</button>
        <button type="button" className="rightbutton disabled" disabled>저장</button>
      </div>
      <p className="todo-category-note">입력한 내용과 카테고리는 이 화면에서 미리 볼 수 있습니다.</p>
    </dialog>
  );
}
