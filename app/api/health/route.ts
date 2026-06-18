import { db } from "@/lib/DataBase";

export async function GET() {
  const result = db.prepare("SELECT 1 as ok").get();

  return Response.json({
    status: "ok",
    database: result,
  });
}