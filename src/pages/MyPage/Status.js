import { useEffect, useState } from "react";
import { getStats } from "./myPageApi";
import StatCard from "./StatCard";

const weekdayLabels = {
    MON: "월요일",
    TUE: "화요일",
    WED: "수요일",
    THU: "목요일",
    FRI: "금요일",
    SAT: "토요일",
    SUN: "일요일",
};

function Status() {
    const [result, setResult] = useState(null);
    const [failed, setFailed] = useState(false);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        const fetchStats = async () => {
            try {
                const stats = await getStats(controller.signal);
                if (!controller.signal.aborted) {
                    setResult(stats);
                }
            } catch {
                if (!controller.signal.aborted) {
                    setFailed(true);
                }
            }
        };

        fetchStats();
        return () => controller.abort();
    }, [attempt]);

    const stats = [
        {
            icon: "🔥",
            title: "연속 달성일",
            statistics: { value: result?.streak ?? "—", unit: result ? "일" : "" },
        },
        {
            icon: "🎯",
            title: "최근 30일 달성률",
            statistics: { value: result?.monthPercent ?? "—", unit: result ? "%" : "" },
        },
        {
            icon: "⭐",
            title: "가장 많이 완료한 요일",
            statistics: { value: weekdayLabels[result?.mostTodoWeek] ?? "—", unit: "" },
        },
    ];

    return (
        <section aria-label="할 일 통계">
            {failed && <p role="alert">통계를 불러오지 못했습니다. <button type="button" onClick={() => {
                setFailed(false);
                setAttempt((value) => value + 1);
            }}>다시 시도</button></p>}
            {!result && !failed && <p role="status">통계를 불러오는 중…</p>}
            <div className="status-section">
                {stats.map((stat) => <StatCard key={stat.title} stats={stat} />)}
            </div>
        </section>
    );
}

export default Status;
