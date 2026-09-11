import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { RegisterForm } from "./register-form";
import { ContactAdminNotice } from "./contact-admin-notice";

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);

  // Public self-registration is disabled by design: accounts are provisioned
  // by Trung tâm CNTT (ADMIN role required for the register API).
  if (!session || session.user.role !== "ADMIN") {
    return <ContactAdminNotice />;
  }

  return <RegisterForm />;
}
