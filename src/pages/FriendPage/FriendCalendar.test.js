import { fireEvent, render, screen } from "@testing-library/react";
import FriendCalendar from "./FriendCalendar";

jest.mock("react-calendar", () => function CalendarMock(props) {
  const done = { date: new Date(2026, 10, 5), view: "month" };
  const pending = { date: new Date(2026, 10, 6), view: "month" };
  const empty = { date: new Date(2026, 10, 7), view: "month" };
  return <div>
    <div data-testid="done" className={props.tileClassName(done)}>{props.tileContent(done)}</div>
    <div data-testid="pending" className={props.tileClassName(pending)}>{props.tileContent(pending)}</div>
    <div data-testid="empty" className={props.tileClassName(empty)}>{props.tileContent(empty)}</div>
    <button onClick={() => props.onChange(new Date(2026, 10, 6))}>날짜 선택</button>
    <button onClick={() => props.onActiveStartDateChange({ activeStartDate: new Date(2026, 11, 1) })}>월 이동</button>
  </div>;
}, { virtual: true });

test("서버 캘린더의 완료 별과 남은 개수 및 날짜·월 콜백을 표시한다", () => {
  const onDateChange = jest.fn();
  const onMonthChange = jest.fn();
  render(<FriendCalendar initialDate={new Date(2026, 10, 5)}
    onDateChange={onDateChange} onMonthChange={onMonthChange}
    remainingByDate={{
      "2026-11-05": { hasTodo: true, remaining: 0 },
      "2026-11-06": { hasTodo: true, remaining: 2 },
    }} />);
  expect(screen.getByTestId("done")).toHaveTextContent("★");
  expect(screen.getByTestId("done")).toHaveClass("tile-done");
  expect(screen.getByTestId("pending")).toHaveTextContent("2");
  expect(screen.getByTestId("pending")).toHaveClass("tile-has");
  expect(screen.getByTestId("empty")).toBeEmptyDOMElement();
  fireEvent.click(screen.getByRole("button", { name: "날짜 선택" }));
  fireEvent.click(screen.getByRole("button", { name: "월 이동" }));
  expect(onDateChange).toHaveBeenCalledWith(new Date(2026, 10, 6));
  expect(onMonthChange).toHaveBeenCalledWith(new Date(2026, 11, 1));
});
