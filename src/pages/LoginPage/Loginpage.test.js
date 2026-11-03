import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./Loginpage";
import axios from "axios";

jest.mock("axios", () => ({ __esModule: true, default: { post: jest.fn() } }));

beforeEach(() => {
  jest.resetAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

function renderCallback(state) {
  return render(<MemoryRouter initialEntries={[`/login/oauth2/code/kakao?code=test-code&state=${state}`]}>
    <Routes>
      <Route path="/login/oauth2/code/kakao" element={<LoginPage />} />
      <Route path="/" element={<p>홈 화면</p>} />
    </Routes>
  </MemoryRouter>);
}

test("카카오 콜백은 state 확인 후 코드를 전송하고 토큰을 저장한다", async () => {
  sessionStorage.setItem("kakaoOAuthState", "matching-state");
  axios.post.mockResolvedValue({ data: { isSuccess: true, result: {
    accessToken: "test-token", username: "테스트",
  } } });
  renderCallback("matching-state");
  expect(await screen.findByText("홈 화면")).toBeInTheDocument();
  expect(axios.post).toHaveBeenCalledWith("/api/auth/kakao", { code: "test-code" }, { withCredentials: true });
  expect(localStorage.getItem("accessToken")).toBe("test-token");
  expect(JSON.parse(localStorage.getItem("user")).username).toBe("테스트");
  expect(sessionStorage.getItem("kakaoOAuthState")).toBeNull();
});

test("state가 일치하지 않는 로그인은 서버에 전송하지 않는다", async () => {
  sessionStorage.setItem("kakaoOAuthState", "expected-state");
  renderCallback("different-state");
  expect(await screen.findByRole("alert")).toHaveTextContent("로그인 요청을 확인할 수 없습니다.");
  expect(axios.post).not.toHaveBeenCalled();
});

test("로그인 실패는 토큰을 저장하지 않고 재시도를 안내한다", async () => {
  sessionStorage.setItem("kakaoOAuthState", "matching-state");
  axios.post.mockRejectedValue(new Error("network"));
  renderCallback("matching-state");
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("로그인에 실패했습니다."));
  expect(localStorage.getItem("accessToken")).toBeNull();
});
