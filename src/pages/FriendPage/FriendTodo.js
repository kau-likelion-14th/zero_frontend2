import React from "react";
import "../../styles/Todo.css";
import "../../styles/FriendTodo.css";

const FriendTodo = ({ title = "To do List", todos = [], categories = {} }) => (
  <div className="friend-todo">
    <div className="todo-container">
      <div className="todo-header"><div className="todo-title">{title}</div></div>
      <div className="todo-list">
        {todos.length === 0 ? (
          <div className="friend-todo__empty">등록된 투두가 없습니다.</div>
        ) : todos.map((todo) => (
          <div key={todo.id} className={`todo-item ${todo.completed ? "done" : ""}`}>
            <div className={`checkbox ${todo.completed ? "checked" : ""}`} aria-hidden="true" />
            <div className="todo-text">{todo.text}</div>
            <div className="todo-category" style={categories[todo.category]}>{todo.category}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
export default FriendTodo;
