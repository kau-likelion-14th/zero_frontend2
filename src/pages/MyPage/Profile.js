import { useEffect, useRef, useState } from "react";
import { getProfile, getSongs, saveImage, saveIntro, saveSong, searchSongs } from "./myPageApi";
import ganadi from "../../assets/img/ganadi.png";

const songLabel = ({ title, artist }) => `${title} - ${artist}`;

function Profile() {
    const fileInputRef = useRef(null);
    const searchRequest = useRef(null);
    const saveInProgress = useRef(false);
    const [profile, setProfile] = useState(null);
    const [intro, setIntro] = useState("");
    const [savedSongs, setSavedSongs] = useState(null);
    const [song, setSong] = useState("");
    const [searchResults, setSearchResults] = useState(null);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState("");
    const [selectedSong, setSelectedSong] = useState(null);
    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [profileAttempt, setProfileAttempt] = useState(0);
    const [songAttempt, setSongAttempt] = useState(0);
    const [profileError, setProfileError] = useState(false);
    const [songError, setSongError] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [saveNotice, setSaveNotice] = useState("");

    useEffect(() => {
        const controller = new AbortController();
        getProfile(controller.signal).then((value) => {
            if (controller.signal.aborted) return;
            setProfile(value);
            setIntro(value.introduction ?? "");
        }, () => {
            if (!controller.signal.aborted) setProfileError(true);
        });
        return () => controller.abort();
    }, [profileAttempt]);

    useEffect(() => {
        const controller = new AbortController();
        getSongs(controller.signal).then((songs) => {
            if (controller.signal.aborted) return;
            setSavedSongs(songs);
            setSong(songs.length ? songLabel(songs[0]) : "");
        }, () => {
            if (!controller.signal.aborted) setSongError(true);
        });
        return () => controller.abort();
    }, [songAttempt]);

    useEffect(() => () => searchRequest.current?.abort(), []);
    useEffect(() => () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
    }, [previewUrl]);

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        setSaveNotice("");
        if (!file.size || file.size > 50 * 1024 * 1024) {
            setSaveError("50MB 이하의 이미지 파일을 선택해 주세요.");
            return;
        }
        setSaveError("");
        setSelectedImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const introChanged = profile && intro !== (profile.introduction ?? "");
    const hasChanges = introChanged || selectedImageFile || selectedSong;

    const handleSave = async () => {
        if (saveInProgress.current || !hasChanges) return;
        saveInProgress.current = true;
        setSaving(true);
        setSaveError("");
        setSaveNotice("");
        let field = "한 줄 소개";

        try {
            if (introChanged) {
                const updated = await saveIntro(intro);
                setProfile(updated);
                setIntro(updated.introduction ?? "");
            }

            field = "프로필 사진";
            if (selectedImageFile) {
                setProfile(await saveImage(selectedImageFile));
                setSelectedImageFile(null);
                setPreviewUrl(null);
            }

            field = "좋아하는 노래";
            if (selectedSong) {
                const saved = await saveSong(selectedSong.songId);
                setSavedSongs((songs) => [saved, ...songs.filter(({ songId }) => songId !== saved.songId)]);
                setSong(songLabel(saved));
                setSelectedSong(null);
            }
            setSearchResults(null);
            if (!selectedSong && savedSongs) setSong(savedSongs.length ? songLabel(savedSongs[0]) : "");
            setSaveNotice("프로필을 저장했습니다.");
        } catch {
            setSaveError(`${field} 저장에 실패했습니다. 다시 시도해 주세요.`);
        } finally {
            saveInProgress.current = false;
            setSaving(false);
        }
    };

    const handleSearchSong = async () => {
        const query = song.trim();
        if (!query || saving) return;
        searchRequest.current?.abort();
        const controller = new AbortController();
        searchRequest.current = controller;
        setSearching(true);
        setSearchError("");
        setSearchResults(null);
        try {
            const results = await searchSongs(query, controller.signal);
            if (!controller.signal.aborted) setSearchResults(results);
        } catch {
            if (!controller.signal.aborted) setSearchError("노래 검색에 실패했습니다. 다시 시도해 주세요.");
        } finally {
            if (!controller.signal.aborted) setSearching(false);
        }
    };

    const handleSelectSong = (item) => {
        setSaveNotice("");
        setSaveError("");
        setSelectedSong(item);
        setSong(songLabel(item));
        setSearchResults(null);
    };

    const displayImageSrc = previewUrl || profile?.profileImageUrl || ganadi;
    return (
        <div className="profile-section">
            <div className="profile-top">
                <div className="profile-img-wrap">
                    <img src={displayImageSrc} alt="프로필" className="profile-img" onError={(event) => { if (!event.currentTarget.src.endsWith(ganadi)) event.currentTarget.src = ganadi; }} />
                    <button
                        type="button"
                        className="profile-edit-btn"
                        aria-label="프로필 사진 수정" disabled={!profile || saving}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        ✎
                    </button>
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                    />
                </div>
                <span className="profile-nickname">{profile?.username ?? ""}</span>
                <button type="button" className="profile-save-btn" onClick={handleSave} disabled={saving || searching || !hasChanges}>
                    {saving ? "저장 중…" : "프로필 저장"}
                </button>
            </div>

            {profileError && <p role="alert">프로필을 불러오지 못했습니다. <button type="button" onClick={() => {
                setProfileError(false);
                setProfileAttempt((attempt) => attempt + 1);
            }}>다시 시도</button></p>}
            {!profile && !profileError && <p role="status">프로필을 불러오는 중…</p>}
            {saveError && <p role="alert">{saveError}</p>}
            {saveNotice && <p role="status">{saveNotice}</p>}
            <div className="profile-inputs">
                <label className="input-label" htmlFor="profile-intro">한 줄 소개</label>
                <input
                    id="profile-intro"
                    className="profile-input"
                    type="text"
                    placeholder="안녕하세요"
                    value={intro} disabled={!profile || saving} maxLength={255}
                    onChange={(e) => setIntro(e.target.value)}
                />

                <label className="input-label" htmlFor="profile-song">좋아하는 노래</label>
                <div className="song-input-wrap">
                    <span className="song-icon" aria-hidden="true">♪</span>
                    <input
                        id="profile-song"
                        className="song-input"
                        type="text"
                        placeholder="좋아하는 노래를 검색해보세요"
                        value={song} disabled={!savedSongs || saving}
                        onChange={(e) => {
                            searchRequest.current?.abort();
                            setSearching(false);
                            setSearchError("");
                            setSaveNotice("");
                            setSong(e.target.value);
                            setSelectedSong(null);
                            setSearchResults(null);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                                e.preventDefault();
                                handleSearchSong();
                            }
                        }}
                    />
                    <button
                        type="button"
                        className="song-search-btn"
                        aria-label="노래 검색"
                        onClick={handleSearchSong} disabled={!savedSongs || saving || searching || !song.trim()}
                    >
                        <svg
                            width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="#888" strokeWidth="2" strokeLinecap="round"
                            strokeLinejoin="round" aria-hidden="true"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </button>
                </div>

                {songError && <p role="alert">저장한 노래를 불러오지 못했습니다. <button type="button" onClick={() => {
                    setSongError(false);
                    setSongAttempt((attempt) => attempt + 1);
                }}>다시 시도</button></p>}
                {!savedSongs && !songError && <p role="status">저장한 노래를 불러오는 중…</p>}
                {searchError && <p role="alert">{searchError}</p>}
                {searching && <p role="status">노래를 검색하는 중…</p>}
                {searchResults && (
                    <div className="song-search-results">
                        {searchResults.length === 0 ? (
                            <p>검색 결과가 없습니다.</p>
                        ) : (
                            searchResults.map((item) => (
                                <button
                                    key={item.songId}
                                    type="button"
                                    className="song-search-item"
                                    disabled={saving || savedSongs.some(({ songId }) => songId === item.songId)}
                                    onClick={() => handleSelectSong(item)}
                                >
                                    {songLabel(item)}{savedSongs.some(({ songId }) => songId === item.songId) && " (저장됨)"}
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Profile;
