import { useState } from "react";
import "../../styles/Todo.css";
import TodoModal from "./TodoModal";
import TodoResourceStatus from "./TodoResourceStatus";

const categoryColors = {
  공부: "#E5F8F1",
  운동: "#FFC8BE",
  동아리: "#B6DAFF",
  독서: "#F2E9FF",
  자기계발: "#E1F0FF",
  취미: "#FFF0D6",
};

export default function Todo({ dateKey, resource, saving, saveFailed, onChangeCompletion }) {
  const [modal, setModal] = useState(null);

  return (
    <section className="todo-container" aria-labelledby="todo-title">
      <div className="todo-header">
        <div>
          <h2 className="todo-title" id="todo-title">To do List</h2>
          <time className="todo-date" dateTime={dateKey}>{dateKey}</time>
        </div>
        <button
          className="todo-add"
          type="button"
          aria-label="할 일 카테고리 보기"
          aria-haspopup="dialog"
          onClick={() => setModal({})}
        >
          +
        </button>
      </div>
      <TodoResourceStatus resource={resource} label="할 일 목록을" />
      {saving && <p role="status">완료 상태를 저장하는 중…</p>}
      {saveFailed && <p role="alert">완료 상태를 저장하지 못했습니다. 체크박스를 다시 눌러 주세요.</p>}
      {resource.data?.length === 0 && <p>선택한 날짜에 할 일이 없습니다.</p>}
      <div className="todo-list">
        {resource.data?.map((todo) => (
          <div key={todo.todoId} className={`todo-item ${todo.completed ? "done" : ""}`}>
            <button
              className={`checkbox ${todo.completed ? "checked" : ""}`}
              type="button"
              role="checkbox"
              aria-checked={todo.completed}
              aria-label={todo.description}
              disabled={saving}
              onClick={() => onChangeCompletion(todo)}
            />
            <button
              className="todo-text todo-text-button"
              type="button"
              aria-label={`할 일 보기: ${todo.description}`}
              aria-haspopup="dialog"
              onClick={() => setModal({ todo })}
            >
              {todo.description}
            </button>
            <div
              className="todo-category"
              style={{ backgroundColor: categoryColors[todo.categoryName] || "#F1F1F1" }}
            >
              {todo.categoryName}
            </div>
          </div>
        ))}
      </div>
      {modal && <TodoModal todo={modal.todo} onClose={() => setModal(null)} />}
    </section>
  );
}
