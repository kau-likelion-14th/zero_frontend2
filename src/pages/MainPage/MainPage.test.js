import { act, fireEvent, render, screen, within } from "@testing-library/react";
import api from "../../Api";
import config from "../../Config";
import MainPage from "./MainPage";
import { toDateKey } from "./todoApi";

jest.mock("../../Api", () => ({
  __esModule: true,
  default: { get: jest.fn(), patch: jest.fn() },
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
const success = (result) => ({ data: { isSuccess: true, result } });
const calendar = (hasTodo, remaining) => success({ days: [{ date: dateKey, hasTodo, remaining }] });

beforeEach(() => {
  jest.resetAllMocks();
  api.get.mockImplementation(async (url) => url === config.TODO.CALENDAR
    ? calendar(true, 1)
    : success([todo]));
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
  expect(api.patch).toHaveBeenCalledWith(config.TODO.COMPLETE(42, dateKey), { completed: true });
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
