import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../../styles/Calendar.css";

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function FriendCalendar({
  initialDate, onDateChange, onMonthChange, remainingByDate = {},
}) {
  const getDayMeta = (date) => {
    const day = remainingByDate[toDateKey(date)];
    return {
      hasTodos: day?.hasTodo === true,
      remaining: day?.remaining ?? 0,
      allDone: day?.hasTodo === true && day.remaining === 0,
    };
  };
  return (
    <div className="calendar-container">
      <Calendar value={initialDate}
        onChange={(value) => {
          const date = value instanceof Date ? value : value?.[0];
          if (date instanceof Date) onDateChange?.(date);
        }}
        onActiveStartDateChange={({ activeStartDate }) => {
          if (activeStartDate instanceof Date) onMonthChange?.(activeStartDate);
        }}
        calendarType="gregory" view="month"
        prev2Label={null} next2Label={null} showNeighboringMonth
        formatDay={(locale, date) => String(date.getDate())}
        tileContent={({ date, view }) => {
          if (view !== "month") return null;
          const { hasTodos, remaining, allDone } = getDayMeta(date);
          return hasTodos ? <div className="tile-meta">{allDone ? "★" : remaining}</div> : null;
        }}
        tileClassName={({ date, view }) => {
          if (view !== "month") return "";
          const { hasTodos, allDone } = getDayMeta(date);
          return hasTodos ? (allDone ? "tile-done" : "tile-has") : "";
        }}
      />
    </div>
  );
}
