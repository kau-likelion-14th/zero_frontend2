import React, { useMemo } from "react";

import "../../styles/Todo.css";
import "../../styles/FriendTodo.css";

const dummyTodos = [
  { id: 1, text: "프론트 보충자료 읽기", category: "공부", completed: true },
  { id: 2, text: "FriendTodo 구현하기", category: "공부", completed: false },
  { id: 3, text: "동아리 회의", category: "동아리", completed: false },
];

const dummyCategories = {
  공부: { backgroundColor: "#E5F8F1", color: "#333" },
  일상: { backgroundColor: "#FFC8BE", color: "#333" },
  동아리: { backgroundColor: "#B6DAFF", color: "#333" },
};

const FriendTodo = ({ title = "To do List" }) => {
  const todos = dummyTodos;
  const categories = dummyCategories;

  const counts = useMemo(() => {
    const total = todos.length;
    const done = todos.filter((t) => t.completed).length;
    return { total, done };
  }, [todos]);

  return (
    <div className="friend-todo">
      <div className="todo-container">
        <div className="todo-header">
          <div className="todo-title">{title}</div>
        </div>

        <div className="todo-list">
          {todos.length === 0 ? (
            <div className="friend-todo__empty">등록된 투두가 없습니다.</div>
          ) : (
            todos.map((t) => (
              <div key={t.id} className={`todo-item ${t.completed ? "done" : ""}`}>
                <div className={`checkbox ${t.completed ? "checked" : ""}`} />
                <div className="todo-text">{t.text}</div>
                <div
                  className="todo-category"
                  style={categories[t.category] ?? undefined}
                >
                  {t.category}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendTodo;