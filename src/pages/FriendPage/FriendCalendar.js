import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import React, { useState } from "react";
import "../../styles/Calendar.css";

const toDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const dummyTodosByDate = {
  "2026-05-04": [
    { id: 1, title: "프론트 보충자료 읽기", completed: true },
    { id: 2, title: "FriendCalendar 주석 달기", completed: false },
  ],
  "2026-05-06": [
    { id: 3, title: "친구 페이지 과제 제출", completed: true },
  ],
  "2026-05-10": [
    { id: 4, title: "React 복습하기", completed: false },
    { id: 5, title: "props 정리하기", completed: false },
    { id: 6, title: "useState 정리하기", completed: true },
  ],
};

export default function FriendCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateChange = (value) => {
    const next = value instanceof Date ? value : value?.[0];
    if (!next) return;
    setSelectedDate(next);
  };

  const getDayMeta = (date) => {
    const key = toDateKey(date);
    const list = dummyTodosByDate[key] ?? [];

    if (list.length === 0) {
      return { hasTodos: false, remaining: 0, allDone: false };
    }

    const remaining = list.filter((todo) => !todo.completed).length;

    return {
      hasTodos: true,
      remaining,
      allDone: remaining === 0,
    };
  };

  return (
    <div className="calendar-container">
      <Calendar
        onChange={handleDateChange}
        value={selectedDate}
        calendarType="gregory"
        view="month"
        prev2Label={null}
        next2Label={null}
        showNeighboringMonth={true}
        formatDay={(locale, date) => String(date.getDate())}
        tileContent={({ date, view }) => {
          if (view !== "month") return null;

          const { hasTodos, remaining, allDone } = getDayMeta(date);
          if (!hasTodos) return null;

          return <div className="tile-meta">{allDone ? "★" : remaining}</div>;
        }}
        tileClassName={({ date, view }) => {
          if (view !== "month") return "";

          const { hasTodos, allDone } = getDayMeta(date);
          if (!hasTodos) return "";

          return allDone ? "tile-done" : "tile-has";
        }}
      />
    </div>
  );
}