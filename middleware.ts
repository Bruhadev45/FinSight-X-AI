import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Authentication removed - all routes are now publicly accessible
  return NextResponse.next();
}

export const config = {
  matcher: [],
};