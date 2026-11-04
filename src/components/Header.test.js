import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Header from "./Header";
import api from "../Api";
jest.mock("../Api", () => ({ __esModule: true, default: { post: jest.fn() } }));

beforeEach(() => {
  jest.resetAllMocks();
  localStorage.setItem("accessToken", "test-access-token");
  localStorage.setItem("user", JSON.stringify({ username: "테스트" }));
});

test("로그아웃 성공 시 토큰 제거와 auth 이벤트를 완료하고 로그인 화면으로 이동한다", async () => {
  api.post.mockResolvedValue({ data: { isSuccess: true } });
  const listener = jest.fn();
  window.addEventListener("auth:changed", listener);
  render(<MemoryRouter initialEntries={["/"]}><Routes>
    <Route path="/" element={<Header />} />
    <Route path="/login" element={<p>로그인 화면</p>} />
  </Routes></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: "로그아웃" }));
  expect(await screen.findByText("로그인 화면")).toBeInTheDocument();
  expect(localStorage.getItem("accessToken")).toBeNull();
  expect(localStorage.getItem("user")).toBeNull();
  expect(listener).toHaveBeenCalledTimes(1);
  window.removeEventListener("auth:changed", listener);
});

test("서버 로그아웃 실패는 로그인 정보를 유지하고 중복 요청을 막는다", async () => {
  const alert = jest.spyOn(window, "alert").mockImplementation(() => {});
  const log = jest.spyOn(console, "error").mockImplementation(() => {});
  api.post.mockRejectedValue(new Error("offline"));
  render(<MemoryRouter><Header /></MemoryRouter>);
  const button = screen.getByRole("button", { name: "로그아웃" });
  fireEvent.click(button);
  fireEvent.click(button);
  await waitFor(() => expect(alert).toHaveBeenCalled());
  expect(api.post).toHaveBeenCalledTimes(1);
  expect(localStorage.getItem("accessToken")).toBe("test-access-token");
  alert.mockRestore();
  log.mockRestore();
});
