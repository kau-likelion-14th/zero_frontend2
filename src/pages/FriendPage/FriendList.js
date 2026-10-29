import { useNavigate } from "react-router-dom";
import deleteIcon from "../../assets/icon/delete.png";
import "../../styles/FriendList.css";

// 팔로우한 친구들 보여주는 컴포넌트 (FriendPage에서 씀)
function FriendList(
  {
    title = "팔로우 목록",
    friends = [],                    // 친구 배열 받아옴
    onClickRemove,                   // 삭제 버튼 누르면 부모한테 알려주는 함수
    emptyText = "팔로우하는 친구가 없습니다.",
  }
) {
  const navigate = useNavigate();

  // 친구 클릭하면 상세페이지로 이동 + friend 객체 같이 넘김
  // 받는 쪽(FriendDetailPage)에서 useLocation으로 꺼내씀
  const goFriendDetail = (friend) => {
    navigate(`/friends/${friend.id}`, { state: { friend } });
  };

  return (
    <section className="friend-list">
      <h2 className="friend-list__title">{title}</h2>

      {/* 친구 없으면 안내문, 있으면 리스트 */}
      {friends.length === 0 ? (
        <div className="friend-list__empty">{emptyText}</div>
      ) : (
        <ul className="friend-list__items">
          {/* friends 배열을 li로 하나씩 변환 */}
          {friends.map((friend) => (
            <li key={friend.id} className="friend-list__item">
              <div
                className="friend-list__left"
                role="button"
                tabIndex={0}
                onClick={() => {
                  goFriendDetail(friend);   // 친구 정보 영역 클릭 → 상세페이지
                }}
                >


                {/* 프로필 사진 있으면 img, 없으면 기본 아이콘 */}
                <div className="friend-avatar" aria-hidden="true">
                  {friend.profileImageUrl ? (
                    <img
                      className="friend-avatar__img"
                      src={friend.profileImageUrl}
                      alt="프로필 사진"
                      />
                  ) : (
                    <UserIcon/>
                  )}
                </div>


                <div className="friend-info">
                  <div className = "friend-info__top">
                    <span className="friend-info__name">{friend.name}</span>
                    <span className="friend-info__tag">#{friend.tag}</span>
                  </div>

                  {/* bio 있으면 소개글, 없으면 안내문 */}
                  {friend.bio ?(
                    <div className="friend-info__bio">{friend.bio}</div>
                  ) : (
                    <div className="friend-info__empty">소개글이 없습니다.</div>
                  )}
                </div>
              </div>

              {/* 삭제 버튼 - 누르면 부모로 friend 넘김 (부모가 모달 띄움) */}
              <button
                className="friend-remove-btn"
                type="button"
                aria-label="삭제"
                onClick={(e)=>{
                  e.stopPropagation();          // 이거 안 하면 위에 div onClick도 같이 실행됨 (상세페이지로 이동돼버림)
                  onClickRemove?.(friend);
                }}
                >
                  <img className="friend-remove-icon" src={deleteIcon} alt="삭제 아이콘" />
                </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// 프로필 사진 없을 때 쓰는 기본 아이콘
function UserIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5Z" fill="#ffffff" opacity="0.9"/>
      <path d="M4 22c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export default FriendList;