import React from "react";

import "../../styles/Todo.css";
import "../../styles/FriendTodo.css";

// 친구 투두 더미 (지금은 props 안 받고 이거 직접 씀)
const dummyTodos = [
  { id: 1, text: "프론트 보충자료 읽기",   category: "공부",   completed: true },
  { id: 2, text: "FriendTodo 구현하기",    category: "공부",   completed: false },
  { id: 3, text: "동아리 회의",            category: "동아리", completed: false },
];

// 카테고리별 색깔
const dummyCategories = {
  공부:   { backgroundColor: "#E5F8F1", color: "#333" },
  일상:   { backgroundColor: "#FFC8BE", color: "#333" },
  동아리: { backgroundColor: "#B6DAFF", color: "#333" },
};

// 친구 투두 보여주는 컴포넌트 (FriendDetailPage에서 씀)
// 친구 거니까 체크 못함 - 보기만
// ※ 지금은 props로 todos 받아도 무시하고 dummyTodos 쓰고있음 → 나중에 연결 필요
const FriendTodo = ({ title = "To do List" }) => {
  const todos = dummyTodos;
  const categories = dummyCategories;

  return (
    <div className="friend-todo">
      <div className="todo-container">
        <div className="todo-header">
          <div className="todo-title">{title}</div>
        </div>

        <div className="todo-list">
          {/* 비었으면 안내문, 아니면 map으로 한 줄씩 */}
          {todos.length === 0 ? (
            <div className="friend-todo__empty">등록된 투두가 없습니다.</div>
          ) : (
            todos.map((t) => (
              // completed면 "done" 클래스 붙음 → CSS에서 줄긋기 처리
              <div key={t.id} className={`todo-item ${t.completed ? "done" : ""}`}>
                <div className={`checkbox ${t.completed ? "checked" : ""}`} />
                <div className="todo-text">{t.text}</div>
                {/* 카테고리 라벨 - categories에서 색깔 찾아서 inline style로 */}
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
