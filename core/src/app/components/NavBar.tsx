import { getServerSession } from "next-auth/next";
import ClientNavBar from "./ClientNavBar";
import { authOptions } from "../../../lib/auth";

export default async function NavBar() {
  const session = await getServerSession(authOptions);
  
  return <ClientNavBar initialSession={session} />;
}