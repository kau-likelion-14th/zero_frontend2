import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import FriendCalendar from "./FriendCalendar";
import FriendTodo from "./FriendTodo";

import "../../styles/FriendDetailPage.css";

// 카테고리별 색상 → FriendTodo로 props 넘겨서 라벨 배경색으로 씀
const Categories = {
  공부:   { backgroundColor: "#E5F8F1", color: "#333" },
  일상:   { backgroundColor: "#FFC8BE", color: "#333" },
  동아리: { backgroundColor: "#B6DAFF", color: "#333" },
};

// Date → "YYYY-MM-DD" 변환 (key 매칭용)
const toDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// 이전 페이지에서 friend 안 넘겨준 경우 대비한 기본값
const dummyFriend = {
  followId: "1",
  name: "나나",
  tag: "1234",
  bio: "안녕하세요! 저는 나나입니다.",
  profileImage: null,
};

// 친구가 저장한 곡 더미 (상단 음악 카드용)
const dummySavedSongs = [
  { id: 1, title: "Ditto", artist: "NewJeans", imageUrl: null },
];

// 친구 투두 더미
const dummyTodosByDate = {
  "2026-05-04": [
    { id: 1, text: "프론트 보충자료 읽기",        category: "공부",   completed: true },
    { id: 2, text: "FriendDetailPage 주석 달기",  category: "공부",   completed: false },
  ],
  "2026-05-06": [
    { id: 3, text: "친구 페이지 과제 제출",       category: "동아리", completed: true },
  ],
  "2026-05-10": [
    { id: 4, text: "React 복습하기",              category: "공부",   completed: false },
    { id: 5, text: "동아리 회의",                 category: "동아리", completed: false },
    { id: 6, text: "산책하기",                    category: "일상",   completed: true },
  ],
};

// 캘린더에 표시할 "남은 할 일 개수" 더미
const dummyRemainingByDate = {
  "2026-05-04": { hasTodo: true, remaining: 1 },
  "2026-05-06": { hasTodo: true, remaining: 0 },
  "2026-05-10": { hasTodo: true, remaining: 2 },
};

// 친구 상세페이지 - 프로필 + 저장곡 + 캘린더 + 투두
// App.js의 /friends/:id 라우트로 들어옴
// FriendList나 FriendSearch에서 navigate로 진입할 때 friend 객체 같이 넘어옴
function FriendDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // 이전 페이지에서 navigate state로 넘긴 friend 꺼냄
  const passedFriend = location.state?.friend ?? null;

  // 넘어온 게 있으면 그거 쓰고, 없으면 더미 친구
  const [friend] = useState(passedFriend ?? dummyFriend);
  const [savedSongs] = useState(dummySavedSongs);

  // 캘린더에서 클릭된 날짜 - 이게 바뀌면 오른쪽 투두 리스트도 같이 바뀜
  const [selectedDate, setSelectedDate] = useState(new Date("2026-05-04"));
  const [viewDate, setViewDate] = useState(new Date("2026-05-04"));  // 지금 보고있는 달

  const [todosByDate] = useState(dummyTodosByDate);
  const [remainingByDate] = useState(dummyRemainingByDate);

  // 저장곡 중 가장 최근 1개 → 상단 음악 카드에 표시
  const latestSong = useMemo(() => {
    if (!Array.isArray(savedSongs) || savedSongs.length === 0) return null;
    return savedSongs[0];
  }, [savedSongs]);

  // 선택된 날짜의 투두만 추림 → FriendTodo로 넘김
  // selectedDate 바뀌면 자동으로 다시 계산됨
  const todos = useMemo(() => {
    const key = toDateKey(selectedDate);
    return todosByDate[key] ?? [];
  }, [selectedDate, todosByDate]);

  return (
    <div className="friend-detail-page">
      <div className="friend-detail-page__inner">
        <div className="friend-detail-page__top">

          {/* 뒤로가기 - navigate(-1)은 브라우저 히스토리 한 칸 뒤로 */}
          <button
            type="button"
            className="friend-detail-page__back"
            aria-label="뒤로가기"
            onClick={() => navigate(-1)}
          >
            ‹
          </button>

          {/* 친구 프로필 영역 */}
          <div className="friend-detail-page__profile">
            <div className="friend-detail-page__avatar" aria-hidden="true">
              {friend?.profileImage ? (
                <img
                  src={friend.profileImage}
                  alt="profile"
                  style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <UserIcon />
              )}
            </div>

            <div className="friend-detail-page__profile-info">
              <div className="friend-detail-page__name-line">
                <span className="friend-detail-page__name">{friend?.name || " "}</span>
              </div>
              <div className="friend-detail-page__bio">
                {friend?.bio || "한 줄 소개"}
              </div>
            </div>
          </div>

          {/* 친구가 저장한 최근 곡 */}
          {/* latestSong 있으면 카드, 없으면 안내문 */}
          <div className="friend-detail-page__songs-inline">
            {latestSong ? (
              <div className="friend-detail-page__song-inline-item">
                <div className="friend-detail-page__song-inline-cover">
                  {latestSong?.imageUrl ? (
                    <img
                      src={latestSong.imageUrl}
                      alt={latestSong.title || "album"}
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }}
                    />
                  ) : null}
                </div>

                <div className="friend-detail-page__song-inline-info">
                  <div className="friend-detail-page__song-inline-title">
                    {latestSong?.title || "제목 없음"}
                  </div>
                  <div className="friend-detail-page__song-inline-artist">
                    {latestSong?.artist || "아티스트 정보 없음"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="friend-detail-page__songs-inline-empty">
                저장한 곡이 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* 캘린더 + 투두 (좌/우 배치) */}
        <div className="friend-detail-page__grid">

          {/* 왼쪽 캘린더 - 날짜 클릭하면 setSelectedDate 실행 → 오른쪽 투두 같이 바뀜 */}
          <div className="friend-detail-page__calendar">
            <FriendCalendar
              initialDate={selectedDate}
              onDateChange={(date) => date && setSelectedDate(date)}
              onMonthChange={(date) => {
                if (!date) return;
                setViewDate(date);
              }}
              todosByDate={todosByDate}
              remainingByDate={remainingByDate}
            />
          </div>

          {/* 오른쪽 투두 - selectedDate 기준 todos만 내려보냄 */}
          <div className="friend-detail-page__todo">
            <FriendTodo
              title="To do List"
              todos={todos}
              categories={Categories}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function UserIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5Z" fill="#ffffff" opacity="0.9"/>
      <path d="M4 22c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export default FriendDetailPage;