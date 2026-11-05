import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../Api";
import config from "../../Config";
import FriendCalendar from "./FriendCalendar";
import FriendTodo from "./FriendTodo";
import "../../styles/FriendDetailPage.css";

const Categories = {
  공부: { backgroundColor: "#E5F8F1", color: "#333" },
  일상: { backgroundColor: "#FFC8BE", color: "#333" },
  동아리: { backgroundColor: "#B6DAFF", color: "#333" },
};

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function useFriendResource(url, params, validate, retry) {
  const query = JSON.stringify(params);
  const requestKey = JSON.stringify([url, query, retry]);
  const [state, setState] = useState({
    key: null, loading: true, error: "", value: null,
  });

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setState({ key: requestKey, loading: true, error: "", value: null });

    api.get(url, { params: JSON.parse(query), signal: controller.signal })
      .then(({ data }) => {
        if (data?.isSuccess === false || !validate(data?.result)) {
          throw new Error("잘못된 서버 응답입니다.");
        }
        if (active) {
          setState({ key: requestKey, loading: false, error: "", value: data.result });
        }
      })
      .catch(() => {
        if (active) {
          setState({
            key: requestKey, loading: false,
            error: "데이터를 불러오지 못했습니다.", value: null,
          });
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [url, query, validate, requestKey]);

  // 다른 친구나 날짜로 바뀐 순간에도 이전 요청의 결과를 표시하지 않습니다.
  return state.key === requestKey
    ? state
    : { loading: true, error: "", value: null };
}

const validProfile = (value) => typeof value?.username === "string";
const validTodos = (value) =>
  Array.isArray(value) &&
  value.every((todo) =>
    todo?.todoId != null &&
    typeof todo.description === "string" &&
    typeof todo.completed === "boolean"
  );
const validCalendar = (value) =>
  Array.isArray(value?.days) &&
  value.days.every((day) =>
    typeof day?.date === "string" &&
    typeof day.hasTodo === "boolean" &&
    Number.isFinite(day.remaining) && day.remaining >= 0
  );

function ResourceState({ resource, onRetry }) {
  if (resource.loading) return <p role="status">불러오는 중...</p>;
  if (resource.error) {
    return (
      <div>
        <p role="alert">{resource.error}</p>
        <button type="button" onClick={onRetry}>다시 시도</button>
      </div>
    );
  }
  return null;
}

function FriendDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [viewDate, setViewDate] = useState(selectedDate);
  const [retries, setRetries] = useState({ profile: 0, todos: 0, calendar: 0 });
  const retry = (key) => setRetries((prev) => ({ ...prev, [key]: prev[key] + 1 }));

  const profile = useFriendResource(
    config.FOLLOW.PROFILE(id), {}, validProfile, retries.profile
  );
  const todoResource = useFriendResource(
    config.FOLLOW.TODOS(id), { date: toDateKey(selectedDate) }, validTodos, retries.todos
  );
  const calendarResource = useFriendResource(
    config.FOLLOW.CALENDAR(id),
    { year: viewDate.getFullYear(), month: viewDate.getMonth() + 1 },
    validCalendar, retries.calendar
  );
  const [name, ...tags] = (profile.value?.username || "").split("#");
  const todos = useMemo(() => (todoResource.value || []).map((todo) => ({
    id: todo.todoId, text: todo.description,
    category: todo.categoryName, completed: todo.completed,
  })), [todoResource.value]);
  const remainingByDate = useMemo(() => Object.fromEntries(
    (calendarResource.value?.days || []).map((day) => [day.date, {
      hasTodo: day.hasTodo, remaining: day.remaining,
    }])
  ), [calendarResource.value]);

  return (
    <div className="friend-detail-page">
      <div className="friend-detail-page__inner">
        <div className="friend-detail-page__top">
          <button type="button" className="friend-detail-page__back"
            aria-label="뒤로가기" onClick={() => navigate(-1)}>‹</button>
          <section className="friend-detail-page__profile" aria-label="친구 프로필">
            <div className="friend-detail-page__avatar" aria-hidden="true">
              {profile.value?.profileImageUrl ? (
                <img src={profile.value.profileImageUrl} alt=""
                  style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
              ) : <UserIcon />}
            </div>
            <div className="friend-detail-page__profile-info">
              <ResourceState resource={profile} onRetry={() => retry("profile")} />
              {profile.value && (
                <>
                  <div className="friend-detail-page__name-line">
                    <span className="friend-detail-page__name">{name || "이름 없음"}</span>
                    {tags.length > 0 && (
                      <span className="friend-detail-page__tag">#{tags.join("#")}</span>
                    )}
                  </div>
                  <div className="friend-detail-page__bio">
                    {profile.value.introduction || "소개글이 없습니다."}
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
        <div className="friend-detail-page__grid">
          <section className="friend-detail-page__calendar" aria-label="친구 캘린더">
            <ResourceState resource={calendarResource} onRetry={() => retry("calendar")} />
            <FriendCalendar initialDate={selectedDate} onDateChange={setSelectedDate}
              onMonthChange={setViewDate} remainingByDate={remainingByDate} />
          </section>
          <section className="friend-detail-page__todo" aria-label="친구 할 일">
            <ResourceState resource={todoResource} onRetry={() => retry("todos")} />
            {!todoResource.loading && !todoResource.error && (
              <FriendTodo title="To do List" todos={todos} categories={Categories} />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function UserIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5Z"
        fill="#ffffff" opacity="0.9" />
      <path d="M4 22c0-4.418 3.582-8 8-8s8 3.582 8 8"
        stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
export default FriendDetailPage;
