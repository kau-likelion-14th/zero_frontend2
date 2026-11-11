import { useEffect, useState } from "react";

export default function useTodoResource(load, key, revision = 0) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(null);
  const requestKey = `${key}/${revision}/${attempt}`;

  useEffect(() => {
    const controller = new AbortController();
    setResult(null);

    load(key, controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ requestKey, data });
      },
      () => {
        if (!controller.signal.aborted) setResult({ requestKey, failed: true });
      }
    );

    return () => controller.abort();
  }, [load, key, requestKey]);

  const current = result?.requestKey === requestKey ? result : null;
  return {
    data: current?.data,
    loading: !current,
    failed: current?.failed,
    retry: () => setAttempt((value) => value + 1),
  };
}
