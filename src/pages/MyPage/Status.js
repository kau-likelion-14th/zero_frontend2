import StatCard from "./StatCard";

const stats = [
    { icon: "🔥", title: "연속 달성일",          statistics: { value: 0,     unit: "일" } },
    { icon: "🎯", title: "최근 30일 달성률",      statistics: { value: 0,     unit: "%" } },
    { icon: "⭐", title: "가장 많이 완료한 요일", statistics: { value: "토요일", unit: "" } },
];

function Status() {
    return (
        <div className="status-section">
            {stats.map((stat, idx) => (
                <StatCard key={idx} stats={stat} />
            ))}
        </div>
    );
}

export default Status;