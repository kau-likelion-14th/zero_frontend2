import { act, fireEvent, render, screen, waitForElementToBeRemoved, within } from "@testing-library/react";
import api from "../../Api";
import config from "../../Config";
import MainPage from "./MainPage";
import { toDateKey } from "./todoApi";

jest.mock("../../Api", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn(), patch: jest.fn() },
}));

jest.mock("react-calendar", () => function Calendar({
  value, activeStartDate, onChange, onActiveStartDateChange, nextAriaLabel, tileContent,
}) {
  const year = activeStartDate.getFullYear();
  const month = activeStartDate.getMonth();
  const alternateDate = new Date(year, month, value.getDate() === 1 ? 2 : 1);

  return (
    <div>
      <button type="button" onClick={() => onChange(alternateDate)}>다른 날짜 선택</button>
      <button type="button" onClick={() => onActiveStartDateChange({
        activeStartDate: new Date(year, month + 1, 1),
      })}>{nextAriaLabel}</button>
      {tileContent({ date: value.getMonth() === month ? value : activeStartDate })}
    </div>
  );
});

const today = new Date();
const dateKey = toDateKey(today);
const todo = { todoId: 42, description: "API 과제 확인", categoryName: "공부", completed: false };
const categories = [
  { categoryId: 1, categoryName: "공부" },
  { categoryId: 2, categoryName: "운동" },
];
const success = (result) => ({ data: { isSuccess: true, result } });
const calendar = (hasTodo, remaining) => success({ days: [{ date: dateKey, hasTodo, remaining }] });

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
});

beforeEach(() => {
  jest.resetAllMocks();
  api.get.mockImplementation(async (url) => {
    if (url === config.TODO.CALENDAR) return calendar(true, 1);
    if (url === config.TODO.CATEGORIES) return success(categories);
    if (url === config.TODO.DETAIL(42)) return success({ ...todo, routineEnabled: false });
    return success([todo]);
  });
});

test("저장 요청을 중복 전송하지 않고 성공 후 목록과 캘린더를 다시 조회한다", async () => {
  let completed = false;
  let finishPatch;
  api.get.mockImplementation(async (url) => url === config.TODO.CALENDAR
    ? calendar(true, completed ? 0 : 1)
    : success([{ ...todo, completed }]));
  api.patch.mockImplementation(() => new Promise((resolve) => {
    finishPatch = () => {
      completed = true;
      resolve(success({ ...todo, completed }));
    };
  }));

  render(<MainPage />);
  const checkbox = await screen.findByRole("checkbox", { name: todo.description });
  expect(checkbox).not.toBeChecked();
  expect(await screen.findByLabelText("남은 할 일 1개")).toHaveTextContent("1");
  fireEvent.click(checkbox);
  fireEvent.click(checkbox);
  expect(checkbox).toBeDisabled();
  expect(api.patch).toHaveBeenCalledTimes(1);
  expect(api.patch).toHaveBeenCalledWith(`/api/todos/42/dates/${dateKey}/complete`, { completed: true });
  expect(api.get).toHaveBeenCalledTimes(2);

  finishPatch();
  expect(await screen.findByRole("checkbox", { name: todo.description, checked: true })).toBeEnabled();
  expect(await screen.findByLabelText("모든 할 일 완료")).toHaveTextContent("★");
  expect(api.get).toHaveBeenCalledTimes(4);
});

test("완료 저장 실패 시 기존 체크 상태와 캘린더를 유지한다", async () => {
  api.patch.mockRejectedValue(new Error("network"));
  render(<MainPage />);

  const checkbox = await screen.findByRole("checkbox", { name: todo.description });
  fireEvent.click(checkbox);

  expect(await screen.findByRole("alert")).toHaveTextContent("완료 상태를 저장하지 못했습니다.");
  expect(checkbox).not.toBeChecked();
  expect(checkbox).toBeEnabled();
  expect(screen.getByLabelText("남은 할 일 1개")).toBeInTheDocument();
});

test("새 날짜를 선택하면 이전 날짜의 늦은 응답을 버리고 빈 목록을 구분한다", async () => {
  let finishOldDate;
  api.get.mockImplementation((url, { params }) => {
    if (url === config.TODO.CALENDAR) return Promise.resolve(calendar(false, 0));
    if (params.date !== dateKey) return Promise.resolve(success([]));
    return new Promise((resolve) => { finishOldDate = resolve; });
  });
  render(<MainPage />);
  const previousRequest = api.get.mock.calls.find(([url]) => url === config.TODO.LIST)[1];
  const target = new Date(today.getFullYear(), today.getMonth(), today.getDate() === 1 ? 2 : 1);
  fireEvent.click(screen.getByRole("button", { name: "다른 날짜 선택" }));

  expect(await screen.findByText("선택한 날짜에 할 일이 없습니다.")).toBeInTheDocument();
  expect(previousRequest.signal.aborted).toBe(true);
  expect(api.get).toHaveBeenCalledWith(config.TODO.LIST, expect.objectContaining({
    params: { date: toDateKey(target) },
  }));
  await act(async () => finishOldDate(success([todo])));
  expect(screen.queryByText(todo.description)).not.toBeInTheDocument();
  expect(screen.queryByText("★")).not.toBeInTheDocument();
});

test("캘린더 요청 실패 시 다시 시도하고 월을 이동하면 새 월을 조회한다", async () => {
  api.get.mockImplementationOnce(async () => { throw new Error("network"); });
  render(<MainPage />);

  const section = screen.getByRole("region", { name: "할 일 캘린더" });
  expect(await within(section).findByRole("alert")).toHaveTextContent("캘린더를 불러오지 못했습니다.");
  fireEvent.click(within(section).getByRole("button", { name: "다시 시도" }));
  expect(await within(section).findByLabelText("남은 할 일 1개")).toBeInTheDocument();

  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  api.get.mockResolvedValueOnce(success({ days: [
    { date: toDateKey(nextMonth), hasTodo: true, remaining: 2 },
  ] }));
  fireEvent.click(within(section).getByRole("button", { name: "다음 달" }));
  expect(api.get).toHaveBeenLastCalledWith(config.TODO.CALENDAR, expect.objectContaining({
    params: { year: nextMonth.getFullYear(), month: nextMonth.getMonth() + 1 },
  }));
  expect(await within(section).findByLabelText("남은 할 일 2개")).toBeInTheDocument();
  expect(within(section).queryByLabelText("남은 할 일 1개")).not.toBeInTheDocument();
});

test("일반 할 일 등록 실패 시 입력을 유지하고 재시도 성공 후 선택 날짜와 캘린더를 갱신한다", async () => {
  const created = { todoId: 47, categoryName: "운동", description: "달리기", routineEnabled: false };
  const initialGet = api.get.getMockImplementation();
  let saved = false;
  api.get.mockImplementation(async (url, options) => {
    if (saved && url === config.TODO.LIST) return success([{ ...created, completed: false }]);
    if (saved && url === config.TODO.CALENDAR) return calendar(true, 2);
    return initialGet(url, options);
  });
  api.post.mockResolvedValueOnce({ data: { isSuccess: false } }).mockImplementationOnce(async () => {
    saved = true;
    return success(created);
  });

  render(<MainPage />);
  fireEvent.click(screen.getByRole("button", { name: "할 일 추가하기" }));
  const dialog = screen.getByRole("dialog");
  fireEvent.click(await within(dialog).findByRole("radio", { name: "운동" }));
  const input = within(dialog).getByLabelText("내용");
  fireEvent.change(input, { target: { value: " 달리기 " } });
  const save = within(dialog).getByRole("button", { name: "저장" });
  fireEvent.click(save);

  expect(await within(dialog).findByRole("alert")).toHaveTextContent("저장하지 못했습니다");
  expect(input).toHaveValue(" 달리기 ");
  fireEvent.click(save);
  fireEvent.click(save);
  expect(api.post).toHaveBeenCalledTimes(2);
  expect(api.post).toHaveBeenLastCalledWith("/api/todos", {
    categoryName: "운동", description: "달리기", routineEnabled: false,
    startDate: null, endDate: null, week: null,
  }, { params: { date: dateKey } });
  expect(await screen.findByRole("checkbox", { name: "달리기" })).toBeInTheDocument();
  expect(await screen.findByLabelText("남은 할 일 2개")).toBeInTheDocument();
});

test("루틴 등록과 상세 편집에서 기간과 단일 반복 요일을 POST 및 PUT에 전달한다", async () => {
  const existingRoutine = {
    categoryName: "운동", description: "서버에서 불러온 루틴", routineEnabled: true,
    startDate: "2026-11-23", endDate: "2026-12-21", week: "MON",
  };
  const initialGet = api.get.getMockImplementation();
  api.get.mockImplementation(async (url, options) => url === config.TODO.DETAIL(42)
    ? success({ todoId: 42, ...existingRoutine })
    : initialGet(url, options));
  api.post.mockImplementation(async (_url, body) => success({ todoId: 55, ...body }));
  api.put.mockImplementation(async (_url, body) => success({ todoId: 42, ...body }));
  render(<MainPage />);

  fireEvent.click(screen.getByRole("button", { name: "할 일 추가하기" }));
  let dialog = within(screen.getByRole("dialog"));
  fireEvent.change(dialog.getByLabelText("내용"), { target: { value: "매주 운동" } });
  fireEvent.click(dialog.getByRole("button", { name: "루틴 등록하기" }));
  expect(dialog.getByLabelText("시작 날짜")).toHaveValue(dateKey);
  fireEvent.change(dialog.getByLabelText("시작 날짜"), { target: { value: "2026-11-23" } });
  fireEvent.change(dialog.getByLabelText("종료 날짜"), { target: { value: "2026-11-22" } });
  fireEvent.click(dialog.getByRole("radio", { name: "월" }));
  fireEvent.click(dialog.getByRole("button", { name: "저장" }));
  expect(dialog.getByRole("alert")).toHaveTextContent("종료 날짜");
  fireEvent.change(dialog.getByLabelText("종료 날짜"), { target: { value: "2026-12-21" } });
  fireEvent.click(dialog.getByRole("button", { name: "저장" }));
  expect(dialog.getByText(/매주 월요일/)).toBeInTheDocument();
  await dialog.findByRole("radio", { name: "공부" });
  const closed = waitForElementToBeRemoved(() => screen.queryByRole("dialog"));
  fireEvent.click(dialog.getByRole("button", { name: "저장" }));
  await closed;
  await screen.findByRole("button", { name: `할 일 수정하기: ${todo.description}` });
  expect(api.post).toHaveBeenCalledWith("/api/todos", {
    ...existingRoutine, description: "매주 운동", categoryName: "공부",
  }, { params: {} });

  fireEvent.click(screen.getByRole("button", { name: `할 일 수정하기: ${todo.description}` }));
  dialog = within(screen.getByRole("dialog"));
  expect(await dialog.findByLabelText("내용")).toHaveValue(existingRoutine.description);
  expect(api.get).toHaveBeenCalledWith("/api/todos/42", expect.objectContaining({ signal: expect.anything() }));
  expect(await dialog.findByRole("radio", { name: "운동" })).toBeChecked();
  fireEvent.click(dialog.getByRole("button", { name: "루틴 수정하기" }));
  expect(dialog.getByLabelText("종료 날짜")).toHaveValue("2026-12-21");
  expect(dialog.getByRole("radio", { name: "월" })).toBeChecked();
  fireEvent.click(dialog.getByRole("radio", { name: "수" }));
  fireEvent.click(dialog.getByRole("button", { name: "저장" }));
  const saved = waitForElementToBeRemoved(() => screen.queryByRole("dialog"));
  fireEvent.click(dialog.getByRole("button", { name: "저장" }));
  expect(api.put).toHaveBeenCalledWith("/api/todos/42", { ...existingRoutine, week: "WED" });
  await saved;
  expect(await screen.findByRole("button", { name: `할 일 수정하기: ${todo.description}` })).toBeInTheDocument();
});

test("삭제 확인 후 선택한 날짜의 경로를 호출하고 목록과 캘린더를 갱신한다", async () => {
  const initialGet = api.get.getMockImplementation();
  let deleted = false;
  api.get.mockImplementation(async (url, options) => {
    if (deleted && url === config.TODO.LIST) return success([]);
    if (deleted && url === config.TODO.CALENDAR) return calendar(false, 0);
    return initialGet(url, options);
  });
  api.delete.mockImplementation(async () => {
    deleted = true;
    return success("OK");
  });

  render(<MainPage />);
  fireEvent.click(await screen.findByRole("button", { name: `할 일 수정하기: ${todo.description}` }));
  const dialog = within(screen.getByRole("dialog"));
  fireEvent.click(await dialog.findByRole("button", { name: "삭제" }));
  fireEvent.click(dialog.getByRole("button", { name: "취소" }));
  expect(api.delete).not.toHaveBeenCalled();
  fireEvent.click(dialog.getByRole("button", { name: "삭제" }));
  expect(dialog.getByText(`${dateKey}의 할 일을 삭제할까요?`)).toBeInTheDocument();
  fireEvent.click(dialog.getByRole("button", { name: "삭제" }));
  expect(api.delete).toHaveBeenCalledWith(`/api/todos/42/dates/${dateKey}`);
  expect(await screen.findByText("선택한 날짜에 할 일이 없습니다.")).toBeInTheDocument();
  expect(screen.queryByLabelText("남은 할 일 1개")).not.toBeInTheDocument();
});
