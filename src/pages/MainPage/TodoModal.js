import { useEffect, useRef, useState } from "react";
import RoutineModal, { routineDays } from "./RoutineModal";
import TodoResourceStatus from "./TodoResourceStatus";
import { createTodo, deleteTodo, getCategories, getTodoDetail, updateTodo } from "./todoApi";
import useTodoResource from "./useTodoResource";

export default function TodoModal({ todoId, date, onClose, onChangeTodo }) {
  const dialogRef = useRef(null);
  const requestPending = useRef(false);
  const editing = todoId != null;
  const detail = useTodoResource(getTodoDetail, todoId);
  const categories = useTodoResource(getCategories, "categories");
  const [category, setCategory] = useState();
  const [description, setDescription] = useState();
  const [routine, setRoutine] = useState();
  const [view, setView] = useState("todo");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const todo = detail.data;
  const selectedCategory = category ?? todo?.categoryName ?? categories.data?.[0]?.categoryName;
  const content = description ?? todo?.description ?? "";
  const schedule = routine ?? (todo?.routineEnabled ? todo : null);
  const scheduleDay = routineDays.find(([day]) => day === schedule?.week)?.[1];
  const canSave = categories.data?.some(({ categoryName }) => categoryName === selectedCategory) &&
    content.trim().length > 0;

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  useEffect(() => {
    dialogRef.current.querySelector("[data-dialog-focus]")?.focus();
  }, [view]);

  function changeView(nextView) {
    setError("");
    setView(nextView);
  }

  function goBack() {
    if (requestPending.current) return;
    if (view !== "todo") {
      changeView("todo");
      return;
    }
    dialogRef.current.close();
    onClose();
  }

  async function mutate(save, failureMessage) {
    if (requestPending.current) return;

    requestPending.current = true;
    setPending(true);
    setError("");
    try {
      await save();
    } catch {
      setError(failureMessage);
      return;
    } finally {
      requestPending.current = false;
      setPending(false);
    }
    dialogRef.current.close();
    onClose();
    onChangeTodo();
  }

  function saveTodo(event) {
    event.preventDefault();
    if (!canSave) return;

    const payload = {
      categoryName: selectedCategory,
      description: content.trim(),
      routineEnabled: Boolean(schedule),
      startDate: schedule?.startDate || null,
      endDate: schedule?.endDate || null,
      week: schedule?.week || null,
    };
    mutate(
      () => editing ? updateTodo(todoId, payload) : createTodo(date, payload),
      "할 일을 저장하지 못했습니다. 입력 내용을 확인한 뒤 다시 시도해 주세요.",
    );
  }

  return (
    <dialog
      ref={dialogRef}
      className="modal-container todo-category-dialog"
      aria-labelledby="todo-modal-title"
      onCancel={(event) => {
        event.preventDefault();
        goBack();
      }}
    >
      {view === "routine" && (
        <RoutineModal
          date={date}
          initialRoutine={schedule}
          canRemove={!editing && Boolean(schedule)}
          onClose={goBack}
          onSave={(nextRoutine) => {
            setRoutine(nextRoutine);
            changeView("todo");
          }}
        />
      )}
      {view === "delete" && (
        <>
          <h2 className="modal-title" id="todo-modal-title">할 일 삭제하기</h2>
          <p>{date}의 할 일을 삭제할까요?</p>
          {todo.routineEnabled && <p>선택한 날짜의 반복 일정만 삭제됩니다.</p>}
          {error && <p role="alert">{error}</p>}
          {pending && <p role="status">할 일을 삭제하는 중…</p>}
          <div className="modal-actions">
            <button type="button" className="leftbutton2" data-dialog-focus disabled={pending} onClick={goBack}>
              취소
            </button>
            <button type="button" className="leftbutton" disabled={pending} onClick={() => mutate(
              () => deleteTodo(todoId, date),
              "할 일을 삭제하지 못했습니다. 다시 시도해 주세요.",
            )}>
              삭제
            </button>
          </div>
        </>
      )}
      {view === "todo" && (
        <>
          <div className="todo-modal-header">
            <h2 className="modal-title" id="todo-modal-title">
              {editing ? "할 일 수정하기" : "할 일 추가하기"}
            </h2>
            <button type="button" className="todo-modal-close" aria-label="닫기" disabled={pending} onClick={goBack}>
              ×
            </button>
          </div>
          <TodoResourceStatus resource={detail} label="할 일 상세 정보를" />
          {(!editing || todo) && (
            <form className="todo-modal-form" onSubmit={saveTodo}>
              <div className="modal-section">
                <div className="modal-label" id="todo-category-label">카테고리</div>
                <TodoResourceStatus resource={categories} label="카테고리를" />
                {categories.data?.length === 0 && <p>등록된 카테고리가 없습니다.</p>}
                {categories.data?.length > 0 && (
                  <div className="modal-categories todo-category-options" role="radiogroup" aria-labelledby="todo-category-label">
                    {categories.data.map(({ categoryId, categoryName }) => (
                      <label key={categoryId} className="modal-categoryitem">
                        <span>{categoryName}</span>
                        <input
                          type="radio"
                          name="todo-category"
                          checked={selectedCategory === categoryName}
                          disabled={pending}
                          onChange={() => setCategory(categoryName)}
                        />
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-section">
                <label className="modal-label" htmlFor="todo-description">내용</label>
                <div className="input-wrapper">
                  <input
                    id="todo-description"
                    className="text-input"
                    type="text"
                    placeholder="내용을 입력해주세요"
                    maxLength={255}
                    required
                    disabled={pending}
                    value={content}
                    onChange={(event) => setDescription(event.target.value)}
                  />
                </div>
              </div>
              {(!editing || schedule) && (
                <div>
                  <button
                    type="button"
                    className="routine-row"
                    disabled={pending}
                    onClick={() => changeView("routine")}
                  >
                    <span className="routine-label">{schedule ? "루틴 수정하기" : "루틴 등록하기"}</span>
                    <span className="routine-button" aria-hidden="true">›</span>
                  </button>
                  {scheduleDay && (
                    <p className="routine-summary">매주 {scheduleDay}요일 · {schedule.startDate} ~ {schedule.endDate}</p>
                  )}
                </div>
              )}
              {error && <p role="alert">{error}</p>}
              {pending && <p role="status">할 일을 저장하는 중…</p>}
              <div className="modal-actions">
                {editing && (
                  <button type="button" className="leftbutton" disabled={pending} onClick={() => changeView("delete")}>
                    삭제
                  </button>
                )}
                <button type="submit" className="rightbutton" disabled={pending || !canSave}>저장</button>
              </div>
            </form>
          )}
        </>
      )}
    </dialog>
  );
}
