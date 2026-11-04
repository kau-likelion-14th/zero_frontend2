// 서버 모델을 화면에서 사용하는 공통 친구 모델로 변환합니다.
export function toFriendModel(user) {
  if (user?.userId == null) throw new Error("사용자 ID가 없습니다.");
  const [name, ...tags] = (user.userName || "").split("#");
  return {
    id: String(user.userId),
    userId: user.userId,
    name: name || "이름 없음",
    tag: tags.join("#"),
    bio: user.introduction || "",
    profileImageUrl: user.profileImageUrl || null,
  };
}
