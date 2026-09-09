import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProfileForm } from "@/components/settings/profile-form";
import { TwoFactorForm } from "@/components/settings/two-factor-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true, avatar: true, twoFactorEnabled: true, id: true },
  });

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="font-mono text-2xl uppercase tracking-[0.2em] text-muted-foreground mb-4">
        <span className="text-primary">▶</span> CÀI ĐẶT CÁ NHÂN
      </h1>
      {user && (
        <>
          <ProfileForm initialData={user} />
          {/* 2FA */}
          <TwoFactorForm userId={user.id} twoFactorEnabled={user.twoFactorEnabled ?? false} />
        </>
      )}
    </div>
  );
}
