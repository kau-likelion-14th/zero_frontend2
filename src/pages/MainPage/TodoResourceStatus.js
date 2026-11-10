export default function TodoResourceStatus({ resource, label }) {
  if (resource.loading) return <p role="status">{label} 불러오는 중…</p>;
  if (!resource.failed) return null;

  return (
    <div>
      <p role="alert">{label} 불러오지 못했습니다.</p>
      <button type="button" onClick={resource.retry}>다시 시도</button>
    </div>
  );
}
