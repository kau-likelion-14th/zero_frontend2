import api from "../../Api";

async function result(request, valid) {
    const { data } = await request;
    if (data?.isSuccess !== true || !valid(data.result)) {
        throw new Error("서버 응답을 확인할 수 없습니다.");
    }
    return data.result;
}

const isProfile = (value) => typeof value?.username === "string";
const isSong = (value) => typeof value?.songId === "string" &&
    typeof value.title === "string" && typeof value.artist === "string";
const isSongList = (value) => Array.isArray(value) && value.every(isSong);

export const getProfile = (signal) => result(api.get("/api/profile", { signal }), isProfile);
export const getSongs = (signal) => result(api.get("/api/youtube/me", { signal }), isSongList);
export const searchSongs = (query, signal) =>
    result(api.get("/api/youtube/search", { params: { q: query }, signal }), isSongList);
export const saveIntro = (introduce) =>
    result(api.put("/api/profile/intro", { introduce }), isProfile);
export const saveSong = (songId) =>
    result(api.post("/api/youtube/save", { songId }), isSong);
export const getStats = (signal) => result(api.get("/api/statistic", { signal }),
    (value) => Number.isInteger(value?.streak) && Number.isInteger(value.monthPercent));

export function saveImage(file) {
    const form = new FormData();
    form.append("image", file);
    return result(api.put("/api/profile", form, {
        headers: { "Content-Type": "multipart/form-data" },
    }), isProfile);
}
