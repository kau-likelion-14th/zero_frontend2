import api from "../../Api";
import config from "../../Config";

export function toDateKey(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function readResult({ data }, validate) {
  if (data?.isSuccess !== true || !validate(data.result)) {
    throw new Error("잘못된 서버 응답입니다.");
  }
  return data.result;
}

const isTodo = (todo) => todo?.todoId != null &&
  typeof todo.description === "string" &&
  typeof todo.categoryName === "string";

const isTodoDetail = (todo) => isTodo(todo) && typeof todo.routineEnabled === "boolean";

const isCalendarDay = (day) => typeof day?.date === "string" &&
  typeof day.hasTodo === "boolean" && Number.isInteger(day.remaining) && day.remaining >= 0;

const isCategory = (category) => category?.categoryId != null &&
  typeof category.categoryName === "string";

export async function getTodos(date, signal) {
  const response = await api.get(config.TODO.LIST, { params: { date }, signal });
  return readResult(response, (result) =>
    Array.isArray(result) && result.every((todo) => isTodo(todo) && typeof todo.completed === "boolean")
  );
}

export async function getCalendar(monthKey, signal) {
  const [year, month] = monthKey.split("-").map(Number);
  const response = await api.get(config.TODO.CALENDAR, { params: { year, month }, signal });
  const { days } = readResult(response, (result) =>
    Array.isArray(result?.days) && result.days.every(isCalendarDay)
  );
  return Object.fromEntries(days.map((day) => [day.date, day]));
}

export async function getCategories(_key, signal) {
  const response = await api.get(config.TODO.CATEGORIES, { signal });
  return readResult(response, (result) => Array.isArray(result) && result.every(isCategory));
}

export async function setTodoCompleted(todoId, date, completed) {
  const response = await api.patch(`${config.TODO.OCCURRENCE(todoId, date)}/complete`, { completed });
  readResult(response, (result) => isTodo(result) &&
    result.todoId === todoId && result.completed === completed);
}

export async function getTodoDetail(todoId, signal) {
  const response = await api.get(config.TODO.DETAIL(todoId), { signal });
  return readResult(response, (todo) => isTodoDetail(todo) && todo.todoId === todoId);
}

export async function createTodo(date, todo) {
  const response = await api.post(config.TODO.LIST, todo, {
    params: todo.routineEnabled ? {} : { date },
  });
  return readResult(response, isTodoDetail);
}

export async function updateTodo(todoId, todo) {
  const response = await api.put(config.TODO.DETAIL(todoId), todo);
  return readResult(response, (result) => isTodoDetail(result) && result.todoId === todoId);
}

export async function deleteTodo(todoId, date) {
  const response = await api.delete(config.TODO.OCCURRENCE(todoId, date));
  readResult(response, (result) => result === "OK");
}
