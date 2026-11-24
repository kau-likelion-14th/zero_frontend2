import { useState } from "react";

export const routineDays = [
  ["MON", "월"], ["TUE", "화"], ["WED", "수"], ["THU", "목"],
  ["FRI", "금"], ["SAT", "토"], ["SUN", "일"],
];

export default function RoutineModal({ date, initialRoutine, canRemove, onClose, onSave }) {
  const [error, setError] = useState("");

  function save(event) {
    event.preventDefault();
    const { startDate, endDate, week } = Object.fromEntries(new FormData(event.currentTarget));
    if (endDate < startDate) {
      setError("종료 날짜는 시작 날짜와 같거나 그 이후여야 합니다.");
      return;
    }

    const repeatDay = routineDays.findIndex(([day]) => day === week);
    const start = new Date(`${startDate}T00:00:00Z`);
    const offset = (repeatDay + 8 - start.getUTCDay()) % 7;
    start.setUTCDate(start.getUTCDate() + offset);
    if (start > new Date(`${endDate}T00:00:00Z`)) {
      setError("선택한 기간에 반복 요일이 없습니다. 날짜 또는 요일을 확인해 주세요.");
      return;
    }

    onSave({ startDate, endDate, week });
  }

  return (
    <form className="todo-modal-form" onSubmit={save}>
      <div className="todo-modal-header">
        <h2 className="modal-title" id="todo-modal-title">루틴 {initialRoutine ? "수정하기" : "등록하기"}</h2>
        <button type="button" className="todo-modal-close" aria-label="돌아가기" data-dialog-focus onClick={onClose}>
          ×
        </button>
      </div>
      <div className="modal-section">
        <label className="modal-label" htmlFor="routine-start">시작 날짜</label>
        <input id="routine-start" name="startDate" type="date" className="date-input" required defaultValue={initialRoutine?.startDate || date} />
      </div>
      <div className="modal-section">
        <label className="modal-label" htmlFor="routine-end">종료 날짜</label>
        <input id="routine-end" name="endDate" type="date" className="date-input" required defaultValue={initialRoutine?.endDate || ""} />
      </div>
      <div className="modal-section">
        <div className="modal-label" id="routine-week-label">반복 요일</div>
        <div className="modal-categories todo-category-options routine-week-options" role="radiogroup" aria-labelledby="routine-week-label">
          {routineDays.map(([day, label]) => (
            <label key={day} className="modal-categoryitem">
              <span>{label}</span>
              <input type="radio" name="week" value={day} required defaultChecked={initialRoutine?.week === day} />
            </label>
          ))}
        </div>
      </div>
      {error && <p role="alert">{error}</p>}
      <div className="modal-actions">
        <button type="button" className="leftbutton2" onClick={onClose}>취소</button>
        {canRemove && <button type="button" className="leftbutton" onClick={() => onSave(null)}>루틴 해제</button>}
        <button type="submit" className="rightbutton">저장</button>
      </div>
    </form>
  );
}
