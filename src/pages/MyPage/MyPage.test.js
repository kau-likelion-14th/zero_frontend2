import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import api from "../../Api";
import MyPage from "./MyPage";

jest.mock("../../Api", () => ({
    __esModule: true,
    default: { get: jest.fn(), put: jest.fn(), post: jest.fn() },
}));

const profile = { username: "LTE 테스트", introduction: "저장된 소개", profileImageUrl: null };
const oldSong = { songId: "old", title: "저장된 곡", artist: "저장된 가수" };
const newSong = { songId: "new", title: "새 곡", artist: "새 가수" };
const success = (value) => ({ data: { isSuccess: true, result: value } });

beforeEach(() => {
    jest.resetAllMocks();
    api.get.mockImplementation(async (url) => {
        const values = {
            "/api/profile": profile,
            "/api/youtube/me": [oldSong],
            "/api/youtube/search": [oldSong, newSong],
            "/api/statistic": { streak: 3, monthPercent: 42, mostTodoWeek: "TUE" },
        };
        if (!(url in values)) throw Error(url);
        return success(values[url]);
    });
});

test("마이페이지를 열면 프로필, 저장곡, 통계를 서버에서 조회한다", async () => {
    render(<MyPage />);

    expect(await screen.findByText(profile.username)).toBeInTheDocument();
    expect(screen.getByLabelText("한 줄 소개")).toHaveValue(profile.introduction);
    expect(screen.getByLabelText("좋아하는 노래")).toHaveValue("저장된 곡 - 저장된 가수");
    expect(await within(screen.getByRole("region", { name: "할 일 통계" })).findByText("화요일")).toBeInTheDocument();
    expect(api.get.mock.calls.map(([url]) => url)).toEqual(
        expect.arrayContaining(["/api/profile", "/api/youtube/me", "/api/statistic"]),
    );
    expect(screen.getByRole("button", { name: "프로필 저장" })).toBeDisabled();
});

test("소개를 한 번 저장하고, 노래 저장에 실패한 경우 노래만 재시도한다", async () => {
    api.put.mockResolvedValue(success({ ...profile, introduction: "새 소개" }));
    api.post.mockRejectedValueOnce(new Error("network")).mockResolvedValueOnce(success(newSong));
    render(<MyPage />);
    await screen.findByText(profile.username);

    fireEvent.change(screen.getByLabelText("한 줄 소개"), { target: { value: "새 소개" } });
    fireEvent.change(screen.getByLabelText("좋아하는 노래"), { target: { value: "새 곡" } });
    fireEvent.click(screen.getByRole("button", { name: "노래 검색" }));
    expect(api.get).toHaveBeenCalledWith("/api/youtube/search", expect.objectContaining({ params: { q: "새 곡" } }));
    expect(await screen.findByRole("button", { name: /저장된 곡.*저장됨/ })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "새 곡 - 새 가수" }));
    fireEvent.click(screen.getByRole("button", { name: "프로필 저장" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("좋아하는 노래 저장에 실패");
    fireEvent.click(screen.getByRole("button", { name: "프로필 저장" }));
    await screen.findByText("프로필을 저장했습니다.");
    expect(api.put).toHaveBeenCalledTimes(1);
    expect(api.put).toHaveBeenCalledWith("/api/profile/intro", { introduce: "새 소개" });
    expect(api.post).toHaveBeenNthCalledWith(2, "/api/youtube/save", { songId: "new" });
});

test("프로필 사진을 정확한 멀티파트 필드로 저장하고 서버 이미지로 갱신한다", async () => {
    const file = new File(["image fixture"], "profile.png", { type: "image/png" });
    const createObjectURL = jest.fn(() => "blob:profile");
    const revokeObjectURL = jest.fn();
    Object.assign(URL, { createObjectURL, revokeObjectURL });
    api.put.mockResolvedValue(success({ ...profile, profileImageUrl: "https://example.com/profile.png" }));

    const { container } = render(<MyPage />);
    await screen.findByText(profile.username);
    fireEvent.change(container.querySelector('input[type="file"]'), { target: { files: [file] } });
    expect(screen.getByRole("img", { name: "프로필" })).toHaveAttribute("src", "blob:profile");
    fireEvent.click(screen.getByRole("button", { name: "프로필 저장" }));
    await screen.findByText("프로필을 저장했습니다.");

    const [url, form] = api.put.mock.calls[0];
    expect(url).toBe("/api/profile");
    expect(form.get("image")).toBe(file);
    expect(screen.getByRole("img", { name: "프로필" })).toHaveAttribute("src", "https://example.com/profile.png");
    await waitFor(() => expect(revokeObjectURL).toHaveBeenCalledWith("blob:profile"));
});
