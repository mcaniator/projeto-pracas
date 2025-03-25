import {
  type DefaultSession,
  type NextAuthOptions,
  getServerSession,
} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ success: true });
}
