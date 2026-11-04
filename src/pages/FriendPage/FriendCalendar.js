import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import React, { useState } from "react";
import "../../styles/Calendar.css";

// Date 객체 → "2026-05-04" 형식 문자열로 바꿈
// 아래 dummyTodosByDate의 key랑 맞추려고
const toDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");  // 1월 → "01"
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// 날짜별 투두 더미 (key는 "YYYY-MM-DD")
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

// 친구 캘린더 (FriendDetailPage에서 씀)
export default function FriendCalendar() {
  // 지금 선택된 날짜 - 클릭할 때마다 바뀜
  const [selectedDate, setSelectedDate] = useState(new Date());

  // 날짜 클릭 시 실행 - state 업데이트되면 해당 날짜 하이라이트됨
  const handleDateChange = (value) => {
    const next = value instanceof Date ? value : value?.[0];
    if (!next) return;
    setSelectedDate(next);
  };

  // 특정 날짜에 투두 있는지/몇 개 남았는지/다 했는지 계산
  // 캘린더 칸에 숫자나 ★ 표시할 때 씀
  const getDayMeta = (date) => {
    const key = toDateKey(date);
    const list = dummyTodosByDate[key] ?? [];  // 그 날 투두 없으면 빈 배열

    if (list.length === 0) {
      return { hasTodos: false, remaining: 0, allDone: false };
    }

    // 완료 안 된 것만 골라서 개수 셈
    const remaining = list.filter((todo) => !todo.completed).length;

    return {
      hasTodos: true,
      remaining,                  // 남은 개수 → 숫자로 표시
      allDone: remaining === 0,   // 다 했으면 ★
    };
  };

  return (
    <div className="calendar-container">
      <Calendar
        onChange={handleDateChange}     // 날짜 클릭하면 selectedDate 바뀜
        value={selectedDate}            // 지금 선택된 날 (이게 하이라이트됨)
        calendarType="gregory"
        view="month"
        prev2Label={null}               // 년 단위 이동 버튼 숨김
        next2Label={null}
        showNeighboringMonth={true}     // 이전/다음달 날짜도 흐리게 표시
        formatDay={(locale, date) => String(date.getDate())}   // "5일" 말고 "5"만

        // 각 날짜 칸 안에 들어갈 내용
        // 다 했으면 ★, 아니면 남은 개수 숫자
        tileContent={({ date, view }) => {
          if (view !== "month") return null;

          const { hasTodos, remaining, allDone } = getDayMeta(date);
          if (!hasTodos) return null;

          return <div className="tile-meta">{allDone ? "★" : remaining}</div>;
        }}

        // 각 날짜 칸에 className 붙임 → CSS로 배경색 다르게
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