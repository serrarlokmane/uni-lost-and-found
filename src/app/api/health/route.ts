// F11: health check used by Docker HEALTHCHECK and Render.
// It says nothing about the database or versions, so it leaks no internal details.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    { status: "ok" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
