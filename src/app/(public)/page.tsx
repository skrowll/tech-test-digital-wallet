import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/config/auth";

export default async function PublicPage() {
  const session = await getServerSession(authOptions);
  
  if (session?.user) {
    redirect("/dashboard");
  } else {
    redirect("/auth/login"); 
  }
}