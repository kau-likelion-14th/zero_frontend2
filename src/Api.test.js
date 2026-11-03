import axios from "axios";
import api, { renewAccessToken } from "./Api";

jest.mock("axios", () => {
  const client = jest.fn();
  client.interceptors = {
    request: { use: (callback) => { client.onRequest = callback; } },
    response: { use: (success, failure) => { client.onFailure = failure; } },
  };
  return { __esModule: true, default: { create: () => client, post: jest.fn() } };
});

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

test("저장한 액세스 토큰을 Bearer 헤더에 실제 값으로 넣는다", () => {
  localStorage.setItem("accessToken", "actual-token");
  const request = api.onRequest({ headers: {} });
  expect(request.headers.Authorization).toBe("Bearer actual-token");
});

test("동시에 발생한 재발급은 한 요청을 공유하고 새 토큰을 저장한다", async () => {
  let complete;
  axios.post.mockImplementation(() => new Promise((resolve) => { complete = resolve; }));
  const first = renewAccessToken();
  const second = renewAccessToken();
  expect(first).toBe(second);
  expect(axios.post).toHaveBeenCalledTimes(1);
  complete({ data: { isSuccess: true, result: "renewed-token" } });
  await expect(first).resolves.toBe("renewed-token");
  expect(localStorage.getItem("accessToken")).toBe("renewed-token");
});

test("401이면 재발급한 토큰으로 원래 요청을 한 번 재시도한다", async () => {
  axios.post.mockResolvedValue({ data: { isSuccess: true, result: "renewed-token" } });
  api.mockResolvedValue({ data: "retried" });
  const original = { url: "/api/follow/followings", headers: {} };
  await expect(api.onFailure({ response: { status: 401 }, config: original }))
    .resolves.toEqual({ data: "retried" });
  expect(original._retry).toBe(true);
  expect(api).toHaveBeenCalledWith(expect.objectContaining({
    headers: { Authorization: "Bearer renewed-token" },
  }));
});

test("재발급 실패는 로그인 정보를 정리하고, 일반 403은 재발급하지 않는다", async () => {
  localStorage.setItem("accessToken", "expired");
  localStorage.setItem("user", "{}");
  axios.post.mockRejectedValue(new Error("expired refresh token"));
  await expect(api.onFailure({ response: { status: 401 }, config: {
    url: "/api/follow", headers: {},
  } })).rejects.toThrow("expired refresh token");
  expect(localStorage.getItem("accessToken")).toBeNull();
  expect(localStorage.getItem("user")).toBeNull();
  const calls = axios.post.mock.calls.length;
  const forbidden = { response: { status: 403 }, config: { url: "/api/follow" } };
  await expect(api.onFailure(forbidden)).rejects.toBe(forbidden);
  expect(axios.post).toHaveBeenCalledTimes(calls);
});
