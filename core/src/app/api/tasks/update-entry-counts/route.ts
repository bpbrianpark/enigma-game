export async function POST() {
  return Response.json(
    { error: "This endpoint has been deprecated. Use /api/entries/tally." },
    { status: 410 }
  );
}

