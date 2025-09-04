import { getServerSession } from "next-auth";
import { prisma } from "../../lib/prisma";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { User } from "./user";
import { LoginButton, LogOutButton } from "./auth";

export default async function Home() {
  const session = await getServerSession(authOptions)

  const user = await prisma.user.findFirst({
    where: {
      email: 'test@test.com'
    }
  })

  return (
    <main>
      <LoginButton></LoginButton>
      <LogOutButton></LogOutButton>
      <h2>Server Session</h2>
      <pre>{JSON.stringify(session)}</pre>
      <h2>Client Call</h2>
      <User></User>
    </main>
  );
}
