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
  typeof todo.categoryName === "string" &&
  typeof todo.completed === "boolean";

const isCalendarDay = (day) => typeof day?.date === "string" &&
  typeof day.hasTodo === "boolean" && Number.isInteger(day.remaining) && day.remaining >= 0;

const isCategory = (category) => category?.categoryId != null &&
  typeof category.categoryName === "string";

export async function getTodos(date, signal) {
  const response = await api.get(config.TODO.LIST, { params: { date }, signal });
  return readResult(response, (result) => Array.isArray(result) && result.every(isTodo));
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
  const response = await api.patch(config.TODO.COMPLETE(todoId, date), { completed });
  readResult(response, (result) => isTodo(result) &&
    result.todoId === todoId && result.completed === completed);
}
