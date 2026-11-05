import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import FriendDetailPage from "./FriendDetailPage";
import api from "../../Api";

jest.mock("../../Api", () => ({ __esModule: true, default: { get: jest.fn() } }));
jest.mock("./FriendCalendar", () => function CalendarMock({ onDateChange, onMonthChange, remainingByDate }) {
  return <div>
    <button onClick={() => onDateChange(new Date(2026, 10, 6))}>날짜 변경</button>
    <button onClick={() => onMonthChange(new Date(2026, 11, 1))}>월 변경</button>
    <output data-testid="calendar-meta">{JSON.stringify(remainingByDate)}</output>
  </div>;
});

const success = (result) => ({ data: { isSuccess: true, result } });
const profile = { username: "친구#1234", introduction: "반가워요", profileImageUrl: null };
const todo = { todoId: 7, description: "리액트 공부", categoryName: "공부", completed: true };
const calendar = { days: [{ date: "2026-11-06", hasTodo: true, remaining: 2 }] };
const renderPage = () => render(<MemoryRouter initialEntries={["/friends/42"]}><Routes>
  <Route path="/friends/:id" element={<FriendDetailPage />} />
</Routes></MemoryRouter>);

beforeEach(() => {
  jest.resetAllMocks();
  api.get.mockImplementation((url) => Promise.resolve(
    success(url.endsWith("/todos") ? [todo] : url.endsWith("/calendar") ? calendar : profile)
  ));
});

test("프로필·날짜별 투두·월별 캘린더를 각각 요청하고 실제 응답을 표시한다", async () => {
  renderPage();
  expect(await screen.findByText("친구")).toBeInTheDocument();
  expect(screen.getByText("#1234")).toBeInTheDocument();
  expect(await screen.findByText("리액트 공부")).toBeInTheDocument();
  expect(screen.getByText("리액트 공부").closest(".todo-item")).toHaveClass("done");
  expect(screen.getByText("공부")).toHaveStyle({ backgroundColor: "#E5F8F1" });
  expect(api.get).toHaveBeenCalledWith("/api/follow/42", expect.objectContaining({ params: {} }));
  expect(api.get).toHaveBeenCalledWith("/api/follow/42/todos", expect.objectContaining({
    params: { date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) },
  }));
  expect(api.get).toHaveBeenCalledWith("/api/follow/42/calendar", expect.objectContaining({
    params: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 },
  }));
  await waitFor(() => expect(screen.getByTestId("calendar-meta"))
    .toHaveTextContent('"2026-11-06":{"hasTodo":true,"remaining":2}'));
});

test("날짜는 date 파라미터로, 월은 year/month 파라미터로 따로 갱신한다", async () => {
  renderPage();
  await screen.findByText("친구");
  fireEvent.click(screen.getByRole("button", { name: "날짜 변경" }));
  await waitFor(() => expect(api.get).toHaveBeenCalledWith("/api/follow/42/todos",
    expect.objectContaining({ params: { date: "2026-11-06" } })));
  fireEvent.click(screen.getByRole("button", { name: "월 변경" }));
  await waitFor(() => expect(api.get).toHaveBeenCalledWith("/api/follow/42/calendar",
    expect.objectContaining({ params: { year: 2026, month: 12 } })));
  expect(api.get.mock.calls.filter(([url]) => url === "/api/follow/42")).toHaveLength(1);
});

test("투두 요청 실패는 빈 목록으로 숨기지 않고 해당 영역만 재시도한다", async () => {
  let failTodos = true;
  api.get.mockImplementation((url) => {
    if (url.endsWith("/todos") && failTodos) {
      failTodos = false;
      return Promise.reject(new Error("network"));
    }
    return Promise.resolve(success(url.endsWith("/todos") ? [] : url.endsWith("/calendar") ? calendar : profile));
  });
  renderPage();
  const area = screen.getByRole("region", { name: "친구 할 일" });
  expect(await within(area).findByRole("alert")).toHaveTextContent("데이터를 불러오지 못했습니다.");
  expect(screen.getByText("친구")).toBeInTheDocument();
  expect(within(area).queryByText("등록된 투두가 없습니다.")).not.toBeInTheDocument();
  fireEvent.click(within(area).getByRole("button", { name: "다시 시도" }));
  expect(await within(area).findByText("등록된 투두가 없습니다.")).toBeInTheDocument();
  expect(api.get.mock.calls.filter(([url]) => url === "/api/follow/42")).toHaveLength(1);
});

test("완료 여부가 없는 잘못된 투두 응답은 오류로 처리한다", async () => {
  api.get.mockImplementation((url) => Promise.resolve(success(
    url.endsWith("/todos") ? [{ ...todo, completed: undefined }] :
      url.endsWith("/calendar") ? calendar : profile
  )));
  renderPage();
  const area = screen.getByRole("region", { name: "친구 할 일" });
  expect(await within(area).findByRole("alert")).toBeInTheDocument();
  expect(screen.queryByText("리액트 공부")).not.toBeInTheDocument();
});

test("날짜 변경 전의 늦은 응답이 새 날짜의 투두를 덮어쓰지 않는다", async () => {
  let finishOld;
  api.get.mockImplementation((url, options) => {
    if (url.endsWith("/todos")) {
      return options.params.date === "2026-11-06"
        ? Promise.resolve(success([{ ...todo, description: "새 날짜 할 일" }]))
        : new Promise((resolve) => { finishOld = resolve; });
    }
    return Promise.resolve(success(url.endsWith("/calendar") ? calendar : profile));
  });
  renderPage();
  await screen.findByText("친구");
  const signal = api.get.mock.calls.find(([url]) => url.endsWith("/todos"))[1].signal;
  fireEvent.click(screen.getByRole("button", { name: "날짜 변경" }));
  expect(await screen.findByText("새 날짜 할 일")).toBeInTheDocument();
  expect(signal.aborted).toBe(true);
  await act(async () => finishOld(success([{ ...todo, description: "이전 날짜 할 일" }])));
  expect(screen.queryByText("이전 날짜 할 일")).not.toBeInTheDocument();
  expect(screen.getByText("새 날짜 할 일")).toBeInTheDocument();
});
