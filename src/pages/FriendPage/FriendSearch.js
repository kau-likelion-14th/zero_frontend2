import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Api";
import config from "../../Config";
import { toFriendModel } from "./friendModel";
import searchIcon from "../../assets/icon/search.png";
import "../../styles/FriendSearch.css";

function FriendSearch({
  onFollow,
  followingList = [],
  followingId = null,
  followError = "",
  followDisabled = false,
  refreshKey = 0,
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [showAvailable, setShowAvailable] = useState(false);
  const [page, setPage] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [results, setResults] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const nickname = query.trim();

  useEffect(() => {
    if (!nickname && !showAvailable) {
      setResults([]);
      setTotalPages(0);
      setError("");
      setLoading(false);
      return;
    }

    let active = true;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setResults([]);
    setTotalPages(0);

    // 입력을 잠깐 기다리고, 이전 입력에 대한 요청은 취소합니다.
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get(
          nickname ? config.FOLLOW.SEARCH : config.FOLLOW.AVAILABLE,
          {
            params: { ...(nickname ? { nickname } : {}), page, size: 10 },
            signal: controller.signal,
          }
        );
        if (
          data?.isSuccess === false ||
          !Array.isArray(data?.result?.content) ||
          !Number.isInteger(data.result.totalPages) ||
          data.result.totalPages < 0
        ) throw new Error("사용자 목록 응답을 확인해 주세요.");

        if (!active) return;
        // 팔로우 성공으로 마지막 페이지가 사라졌을 때 범위를 보정합니다.
        if (page > 0 && page >= data.result.totalPages) {
          setPage(Math.max(0, data.result.totalPages - 1));
          return;
        }
        setResults(data.result.content.map(toFriendModel));
        setTotalPages(data.result.totalPages);
      } catch {
        if (active) setError("사용자를 불러오지 못했습니다. 다시 시도해 주세요.");
      } finally {
        if (active) setLoading(false);
      }
    }, nickname ? 300 : 0);

    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [nickname, showAvailable, page, retryCount, refreshKey]);

  const handleChange = (event) => {
    const nextQuery = event.target.value;
    setQuery(nextQuery);
    setShowAvailable(false);
    if (nextQuery.trim() !== nickname || showAvailable) {
      setPage(0);
      setResults([]);
      setTotalPages(0);
      setError("");
    }
  };

  const goFriendDetail = (user) => {
    navigate(`/friends/${user.id}`, { state: { friend: user } });
  };

  return (
    <section className="friend-search" aria-labelledby="friend-search-title">
      <h2 id="friend-search-title" className="friend-search__title">팔로우 요청</h2>
      <div className="friend-search__input-box">
        <span className="friend-search__icon" aria-hidden="true">
          <img src={searchIcon} alt="" className="friend-search__icon-img" />
        </span>
        <input
          className="friend-search__input"
          aria-label="닉네임 검색"
          placeholder="닉네임으로 검색"
          value={query}
          onChange={handleChange}
        />
      </div>

      {!nickname && (
        <button
          type="button"
          className="friend-search__browse"
          aria-pressed={showAvailable}
          disabled={followingId !== null}
          onClick={() => {
            setShowAvailable((value) => !value);
            setPage(0);
          }}
        >
          {showAvailable ? "목록 닫기" : "팔로우 가능한 사용자 보기"}
        </button>
      )}
      {followError && <p role="alert">{followError}</p>}

      {!nickname && !showAvailable ? (
        <p className="friend-search__empty">검색할 닉네임을 입력해 주세요.</p>
      ) : loading ? (
        <p className="friend-search__empty" role="status">검색 중...</p>
      ) : error ? (
        <div className="friend-search__empty">
          <p role="alert">{error}</p>
          <button type="button" onClick={() => setRetryCount((count) => count + 1)}>
            다시 시도
          </button>
        </div>
      ) : results.length === 0 ? (
        <p className="friend-search__empty">
          {nickname ? "검색 결과가 없습니다." : "팔로우 가능한 사용자가 없습니다."}
        </p>
      ) : (
        <ul className="friend-search__list">
          {results.map((user) => {
            const isFollowing = followingList.some((friend) => friend.id === user.id);
            const isPending = followingId === user.id;
            return (
              <li key={user.id} className="friend-search__item">
                <div
                  className="friend-search__left"
                  role="button"
                  tabIndex={0}
                  aria-label={`${user.name} 프로필 보기`}
                  onClick={() => goFriendDetail(user)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      goFriendDetail(user);
                    }
                  }}
                >
                  <div className="friend-avatar" aria-hidden="true">
                    {user.profileImageUrl ? (
                      <img src={user.profileImageUrl} alt="" className="friend-avatar__img" />
                    ) : (
                      <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="7" r="5" fill="white" />
                        <path d="M4 22c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="white" strokeWidth="2" />
                      </svg>
                    )}
                  </div>
                  <div className="friend-info">
                    <div className="friend-info__top">
                      <span className="friend-info__name">{user.name}</span>
                      {user.tag && <span className="friend-info__tag">#{user.tag}</span>}
                    </div>
                    <div className="friend-info__bio">{user.bio || "소개글이 없습니다."}</div>
                  </div>
                </div>
                <button
                  type="button"
                  className="friend-follow-btn"
                  disabled={isFollowing || followingId !== null || followDisabled}
                  onClick={() => onFollow?.(user)}
                >
                  {isPending ? "처리 중..." : isFollowing ? "팔로잉" : "팔로우"}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {!loading && !error && totalPages > 1 && (
        <nav className="friend-search__pagination" aria-label="사용자 목록 페이지">
          <button type="button" disabled={page === 0 || followingId !== null}
            onClick={() => setPage((value) => value - 1)}>이전</button>
          <span aria-live="polite">{page + 1} / {totalPages}</span>
          <button type="button" disabled={page + 1 >= totalPages || followingId !== null}
            onClick={() => setPage((value) => value + 1)}>다음</button>
        </nav>
      )}
    </section>
  );
}

export default FriendSearch;
