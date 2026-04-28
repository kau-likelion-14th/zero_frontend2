import { useState, useRef } from "react";
import ganadi from "../../assets/img/ganadi.png";
const profileImg = ganadi;

const profileImageUrl = null;

function Profile() {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [nickname] = useState("정은영");
    const [bio, setBio] = useState("");
    const [song, setSong] = useState("");
    const fileInputRef = useRef(null);

    const handleClickEditIcon = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedImageFile(file);

        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSave = () => {
        console.log({ nickname, bio, song, selectedImageFile });
        alert("프로필이 저장되었습니다!");
    };

    const displayImageSrc = previewUrl || profileImageUrl || profileImg;

    return (
        <div className="profile-section">
            <div className="profile-top">
                <div className="profile-img-wrap">
                    <img src={displayImageSrc} alt="프로필" className="profile-img" />
                    <button className="profile-edit-btn" onClick={handleClickEditIcon}>
                        ✎
                    </button>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                    />
                </div>
                <span className="profile-nickname">{nickname}</span>
                <button className="profile-save-btn" onClick={handleSave}>프로필 저장</button>
            </div>

            <div className="profile-inputs">
                <label className="input-label">한 줄 소개</label>
                <input
                    className="profile-input"
                    type="text"
                    placeholder="안녕하세요"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                />

                <label className="input-label">좋아하는 노래</label>
                <div className="song-input-wrap">
                    <span className="song-icon">♪</span>
                    <input
                        className="song-input"
                        type="text"
                        placeholder="내꺼하자 - 인피니트"
                        value={song}
                        onChange={(e) => setSong(e.target.value)}
                    />
                    <button className="song-search-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Profile;