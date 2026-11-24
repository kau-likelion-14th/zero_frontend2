const forwardedHeaders = ["accept", "authorization", "content-type", "cookie"];
const developmentApi = "http://lte-dev-env.eba-hgqx3mfp.ap-northeast-2.elasticbeanstalk.com";

function unavailable() {
  return Response.json(
    { isSuccess: false, message: "API 서버에 연결할 수 없습니다." },
    { status: 502, headers: { "Cache-Control": "no-store" } },
  );
}

export default async function proxyApi(request) {
  const incoming = new URL(request.url);
  const origin = request.headers.get("origin");
  if (origin && origin !== incoming.origin) {
    return new Response(null, { status: 403 });
  }

  try {
    const upstream = new URL(Netlify.env.get("LTE_API_ORIGIN") || developmentApi);
    if ((upstream.protocol !== "https:" && upstream.origin !== developmentApi) ||
        upstream.origin === incoming.origin ||
        upstream.username || upstream.password) {
      return unavailable();
    }

    upstream.pathname = incoming.pathname;
    upstream.search = incoming.search;
    const headers = new Headers();
    for (const name of forwardedHeaders) {
      const value = request.headers.get(name);
      if (value) headers.set(name, value);
    }

    const response = await fetch(upstream, {
      method: request.method,
      headers,
      body: request.body,
      redirect: "manual",
    });
    if (response.status >= 300 && response.status < 400) return unavailable();

    const responseHeaders = new Headers({ "Cache-Control": "no-store" });
    const contentType = response.headers.get("content-type");
    if (contentType) responseHeaders.set("Content-Type", contentType);
    for (const cookie of response.headers.getSetCookie()) {
      responseHeaders.append("Set-Cookie", cookie);
    }

    return new Response(response.body, { status: response.status, headers: responseHeaders });
  } catch {
    return unavailable();
  }
}
