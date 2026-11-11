import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../../styles/Calendar.css";
import { toDateKey } from "./todoApi";
import TodoResourceStatus from "./TodoResourceStatus";

export default function CustomCalendar({
  selectedDate, activeMonth, onDateChange, onMonthChange, resource,
}) {
  const getDay = (date) => resource.data?.[toDateKey(date)];

  return (
    <section className="calendar-container" aria-label="할 일 캘린더">
      <Calendar
        value={selectedDate}
        activeStartDate={activeMonth}
        onChange={onDateChange}
        onActiveStartDateChange={({ activeStartDate }) => onMonthChange(activeStartDate)}
        locale="ko-KR"
        calendarType="gregory"
        view="month"
        prevAriaLabel="이전 달"
        nextAriaLabel="다음 달"
        prev2Label={null}
        next2Label={null}
        formatDay={(_, date) => String(date.getDate())}
        tileContent={({ date }) => {
          const day = getDay(date);
          if (!day?.hasTodo) return null;

          return (
            <span
              className="tile-meta"
              aria-label={day.remaining === 0 ? "모든 할 일 완료" : `남은 할 일 ${day.remaining}개`}
            >
              {day.remaining === 0 ? "★" : day.remaining}
            </span>
          );
        }}
        tileClassName={({ date }) => {
          const day = getDay(date);
          if (!day?.hasTodo) return "";
          return day.remaining === 0 ? "tile-done" : "tile-has";
        }}
      />
      <TodoResourceStatus resource={resource} label="캘린더를" />
    </section>
  );
}
