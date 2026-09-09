import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ twoFactorEnabled: false });
    }

    const user = await db.user.findUnique({
      where: { email },
      select: { password: true, deletedAt: true, twoFactorEnabled: true },
    });

    if (!user || user.deletedAt) {
      return NextResponse.json({ twoFactorEnabled: false });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ twoFactorEnabled: false });
    }

    return NextResponse.json({ twoFactorEnabled: user.twoFactorEnabled });
  } catch {
    return NextResponse.json({ twoFactorEnabled: false });
  }
}
