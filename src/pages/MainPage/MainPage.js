import { useRef, useState } from "react";
import CustomCalendar from "./Calendar";
import Todo from "./Todo";
import { getCalendar, getTodos, setTodoCompleted, toDateKey } from "./todoApi";
import useTodoResource from "./useTodoResource";
import "../../styles/MainPage.css";

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export default function MainPage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [activeMonth, setActiveMonth] = useState(() => startOfMonth(selectedDate));
  const [revision, setRevision] = useState(0);
  const [saving, setSaving] = useState(false);
  const [failedDate, setFailedDate] = useState(null);
  const saveInProgress = useRef(false);

  const dateKey = toDateKey(selectedDate);
  const calendar = useTodoResource(getCalendar, toDateKey(activeMonth).slice(0, 7), revision);
  const todos = useTodoResource(getTodos, dateKey, revision);

  function selectDate(date) {
    setSelectedDate(date);
    setActiveMonth(startOfMonth(date));
    setFailedDate(null);
  }

  async function changeCompletion(todo) {
    if (saveInProgress.current) return;

    saveInProgress.current = true;
    setSaving(true);
    setFailedDate(null);
    try {
      await setTodoCompleted(todo.todoId, dateKey, !todo.completed);
      setRevision((previous) => previous + 1);
    } catch {
      setFailedDate(dateKey);
    } finally {
      saveInProgress.current = false;
      setSaving(false);
    }
  }

  return (
    <div className="mainpage-container">
      <CustomCalendar
        selectedDate={selectedDate}
        activeMonth={activeMonth}
        onDateChange={selectDate}
        onMonthChange={setActiveMonth}
        resource={calendar}
      />
      <Todo
        dateKey={dateKey}
        resource={todos}
        saving={saving}
        saveFailed={failedDate === dateKey}
        onChangeCompletion={changeCompletion}
      />
    </div>
  );
}
