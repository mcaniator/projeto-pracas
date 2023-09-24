import { NextResponse } from "next/server";
import { categoriesJSONSchema } from "../types";

export async function GET() {
  const categoriesJSON: categoriesJSONSchema[] = await fetch(
    "http://localhost:3333/category",
    { cache: "no-store" },
  ).then((response) => {
    return response.json();
  });

  return NextResponse.json({ categoriesJSON });
}
