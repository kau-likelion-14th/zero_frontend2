import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/FriendSearch.css";
import searchIcon from "../../assets/icon/search.png";

// 더미 유저들 (나중에 백엔드 연결되면 여기 대신 API로)
const dummyUsers = [
    { id: "1", userId: 1, name: "나나",  tag: "1234", bio: "안녕하세요! 저는 나나입니다.", profileImageUrl: null },
    { id: "2", userId: 2, name: "얀",    tag: "2342", bio: "^^",   profileImageUrl: null },
    { id: "3", userId: 3, name: "지말",  tag: "1214", bio: "ㅎㅎ", profileImageUrl: null },
    { id: "4", userId: 4, name: "코다",  tag: "1223", bio: ";ㅁ;", profileImageUrl: null },
    { id: "5", userId: 5, name: "딜런",  tag: "1777", bio: ".",    profileImageUrl: null },
];

// 친구 검색 + 팔로우 컴포넌트 (FriendPage에서 씀)
function FriendSearch({
  title = "팔로우 요청",
  placeholder = "이름/태그로 검색",
  onFollow,             // 팔로우 누르면 부모로 user 올려보내는 함수
  followingList = [],   // 이미 팔로우 중인 친구들 (중복 팔로우 막으려고)
}) {
  const navigate = useNavigate();

  // 검색창에 입력한 값 저장
  // 타이핑할 때마다 query 바뀌고 → results도 다시 계산되고 → 리스트 새로 그려짐
  const [query, setQuery] = useState("");

  // 팔로우 중인 친구들 id만 Set으로 빼둠 → 검색결과에서 "이미 팔로우 중인가?" 빨리 확인 가능
  const followingIdSet = useMemo(() => {
    return new Set(followingList.map((x) => x.id));
  }, [followingList]);

  // query 바뀔 때마다 dummyUsers에서 일치하는 애들만 filter로 추림
  // 빈 문자열이면 빈 배열 (아무것도 안 보임)
  const results = useMemo(() => {
    const q = query.trim();

    if (!q) return [];

    return dummyUsers.filter((user) => {
      return (
        user.name.includes(q) ||
        user.tag.includes(q) ||
        `${user.name}#${user.tag}`.includes(q)   // "이름#태그" 형태로도 검색되게
      );
    });
  }, [query]);

  const goFriendDetail = (friend) => {
    navigate("/friends/detail", { state: { friend } });
  };

  return (
    <section className="friend-search">
      <h2 className="friend-search__title">{title}</h2>

      <div className="friend-search__input-box">
        <span className="friend-search__icon" aria-hidden="true">
          <img src={searchIcon} alt="검색" className="friend-search__icon-img"/>
        </span>

        {/* input - value랑 state 연결, onChange로 setQuery 호출 */}
        <input
          className="friend-search__input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
        />
      </div>

      {/* 3가지 경우 분기:
          - 검색어 비어있음 → 아무것도 안 보여줌
          - 검색해도 결과 없음 → 안내문
          - 결과 있음 → 리스트 */}
      {query.trim() === "" ? null : results.length === 0 ? (
        <div className="friend-search__empty">검색 결과가 없습니다.</div>
      ) : (
        <ul className="friend-search__list">
          {results.map((user) => {
            // 이 유저 이미 팔로우 중인지 → 버튼 텍스트랑 disabled 결정용
            const isFollowing = followingIdSet.has(user.id);

            return (
              <li key={user.id} className="friend-search__item">
                <div
                  className="friend-search__left"
                  role="button"
                  tabIndex={0}
                  onClick={() => goFriendDetail(user)}     // 영역 클릭 → 상세페이지
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") goFriendDetail(user);
                  }}
                >
                  <div className="friend-avatar" aria-hidden="true">
                    {user.profileImageUrl ? (
                      <img src={user.profileImageUrl} alt="" className="friend-avatar__img"/>
                    ) : (
                      <UserIcon />
                    )}
                  </div>

                  <div className="friend-info">
                    <div className="friend-info__top">
                      <span className="friend-info__name">{user.name}</span>
                      <span className="friend-info__tag">#{user.tag}</span>
                    </div>
                    <div className="friend-info__bio">
                      {user.bio || "한 줄 소개"}
                    </div>
                  </div>
                </div>

                {/* 팔로우 버튼 - 이미 팔로우 중이면 "팔로잉"으로 바뀌고 비활성화됨 */}
                <button
                  type="button"
                  className={`friend-follow-btn ${isFollowing ? "is-disabled" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();    // 부모 div의 상세이동 onClick 막기
                    onFollow?.(user);       // 부모로 user 보냄 → 부모가 followingList에 추가 → 이 버튼 "팔로잉"으로 바뀜
                  }}
                  disabled={isFollowing}
                >
                  {isFollowing ? "팔로잉" : "팔로우"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
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

export default FriendSearch;