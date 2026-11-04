import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import FriendPage from "./pages/FriendPage/FriendPage";
import FriendSearch from "./pages/FriendPage/FriendSearch";
import api from "./Api";
import config from "./Config";

jest.mock("./Api", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), delete: jest.fn() },
}));

const user = { userId: 42, userName: "나나#1234", introduction: "안녕하세요!", profileImageUrl: null };
const success = (result) => ({ data: { isSuccess: true, result } });
const pageResult = (content, totalPages = 1) => success({ content, totalPages });
const renderPage = () => render(<MemoryRouter><FriendPage /></MemoryRouter>);
const renderSearch = (props = {}) => render(<MemoryRouter><FriendSearch {...props} /></MemoryRouter>);
const search = (value = "나나") => fireEvent.change(screen.getByRole("textbox", { name: "닉네임 검색" }), { target: { value } });

beforeEach(() => {
  jest.resetAllMocks();
  api.get.mockImplementation((url) => Promise.resolve(
    url === config.FOLLOW.FOLLOWINGS ? success([]) : pageResult([user])
  ));
});

test("빈 검색은 요청하지 않고, 공백을 제거한 nickname과 페이지를 서버로 보낸다", async () => {
  renderSearch();
  expect(api.get).not.toHaveBeenCalled();
  search("  나나  ");
  expect(await screen.findByText("나나")).toBeInTheDocument();
  expect(api.get).toHaveBeenCalledWith(config.FOLLOW.SEARCH, expect.objectContaining({
    params: { nickname: "나나", page: 0, size: 10 },
    signal: expect.any(AbortSignal),
  }));
  expect(screen.getByText("#1234")).toBeInTheDocument();
});

test("팔로우 성공 후 왼쪽 목록 갱신, 중복 클릭 방지, 검색 재조회, 언팔로우 본문을 확인한다", async () => {
  let followed = false;
  let finishFollow;
  api.get.mockImplementation((url) => Promise.resolve(
    url === config.FOLLOW.FOLLOWINGS ? success([]) : pageResult(followed ? [] : [user])
  ));
  api.post.mockImplementation(() => new Promise((resolve) => { finishFollow = () => {
    followed = true;
    resolve(success(user));
  }; }));
  api.delete.mockImplementation(() => { followed = false; return Promise.resolve(success(null)); });
  renderPage();
  search();
  const followButton = await screen.findByRole("button", { name: "팔로우" });
  fireEvent.click(followButton);
  fireEvent.click(followButton);
  expect(api.post).toHaveBeenCalledTimes(1);
  expect(api.post).toHaveBeenCalledWith(config.FOLLOW.CREATE, { toUserId: 42 });
  expect(screen.getByRole("button", { name: "처리 중..." })).toBeDisabled();
  finishFollow();
  expect(await screen.findByText("나나님을 팔로우했습니다.")).toBeInTheDocument();
  expect(await screen.findByText("검색 결과가 없습니다.")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "삭제" }));
  const dialog = screen.getByRole("dialog");
  fireEvent.click(within(dialog).getByRole("button", { name: "예" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(api.delete).toHaveBeenCalledWith(config.FOLLOW.DELETE, { data: { toUserId: 42 } });
  expect(await screen.findByRole("button", { name: "팔로우" })).toBeEnabled();
  expect(screen.getByText("팔로우하는 친구가 없습니다.")).toBeInTheDocument();
});

test("팔로우 실패 시 목록을 추가하지 않고 재시도할 수 있다", async () => {
  api.post.mockRejectedValue(new Error("network"));
  renderPage();
  search();
  fireEvent.click(await screen.findByRole("button", { name: "팔로우" }));
  expect(await screen.findByText("팔로우에 실패했습니다. 다시 시도해 주세요.")).toBeInTheDocument();
  expect(screen.getByText("팔로우하는 친구가 없습니다.")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "팔로우" })).toBeEnabled();
});

test("팔로우 응답의 다른 사용자 ID는 성공으로 표시하지 않는다", async () => {
  api.post.mockResolvedValue(success({ ...user, userId: 99 }));
  renderPage();
  search();
  fireEvent.click(await screen.findByRole("button", { name: "팔로우" }));
  expect(await screen.findByText("팔로우에 실패했습니다. 다시 시도해 주세요.")).toBeInTheDocument();
  expect(screen.getByText("팔로우하는 친구가 없습니다.")).toBeInTheDocument();
});

test("언팔로우 실패 시 친구와 모달을 유지하고 다시 요청할 수 있다", async () => {
  api.get.mockResolvedValue(success([user]));
  api.delete.mockRejectedValue(new Error("network"));
  renderPage();
  fireEvent.click(await screen.findByRole("button", { name: "삭제" }));
  fireEvent.click(screen.getByRole("button", { name: "예" }));
  expect(await screen.findByText("언팔로우에 실패했습니다. 다시 시도해 주세요.")).toBeInTheDocument();
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "예" })).toBeEnabled();
  expect(screen.getByRole("button", { name: "삭제" })).toBeInTheDocument();
});

test("잘못된 목록 응답을 빈 목록으로 숨기지 않고 재시도를 제공한다", async () => {
  api.get.mockResolvedValueOnce(success({ invalid: true })).mockResolvedValue(success([user]));
  renderPage();
  expect(await screen.findByText("팔로우 목록을 불러오지 못했습니다.")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
  expect(await screen.findByText("나나")).toBeInTheDocument();
});

test("검색 실패와 빈 결과를 구분하고 검색 재시도를 제공한다", async () => {
  api.get.mockRejectedValueOnce(new Error("network")).mockResolvedValue(pageResult([], 0));
  renderSearch();
  search();
  expect(await screen.findByRole("alert")).toHaveTextContent("사용자를 불러오지 못했습니다.");
  fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
  expect(await screen.findByText("검색 결과가 없습니다.")).toBeInTheDocument();
});

test("팔로우 가능한 사용자는 명시적으로 열 때 조회하고 페이지를 이동한다", async () => {
  api.get.mockResolvedValue(pageResult([user], 2));
  renderSearch();
  fireEvent.click(screen.getByRole("button", { name: "팔로우 가능한 사용자 보기" }));
  expect(await screen.findByText("1 / 2")).toBeInTheDocument();
  expect(api.get).toHaveBeenLastCalledWith(config.FOLLOW.AVAILABLE, expect.objectContaining({
    params: { page: 0, size: 10 },
  }));
  fireEvent.click(screen.getByRole("button", { name: "다음" }));
  expect(await screen.findByText("2 / 2")).toBeInTheDocument();
  expect(api.get).toHaveBeenLastCalledWith(config.FOLLOW.AVAILABLE, expect.objectContaining({
    params: { page: 1, size: 10 },
  }));
});

test("이전 검색의 늦은 응답이 최신 결과를 덮어쓰지 않는다", async () => {
  let finishOld;
  api.get.mockImplementation((url, options) => options.params.nickname === "옛검색"
    ? new Promise((resolve) => { finishOld = resolve; })
    : Promise.resolve(pageResult([user])));
  renderSearch();
  search("옛검색");
  await waitFor(() => expect(finishOld).toBeDefined());
  const previousSignal = api.get.mock.calls[0][1].signal;
  search("나나");
  expect(await screen.findByText("나나")).toBeInTheDocument();
  expect(previousSignal.aborted).toBe(true);
  finishOld(pageResult([{ ...user, userName: "오래된결과#1234" }]));
  await waitFor(() => expect(screen.queryByText("오래된결과")).not.toBeInTheDocument());
});

test("이미 팔로우한 사용자는 팔로잉으로 표시하고 버튼을 비활성화한다", async () => {
  renderSearch({ followingList: [{ id: "42" }] });
  search();
  expect(await screen.findByRole("button", { name: "팔로잉" })).toBeDisabled();
});
