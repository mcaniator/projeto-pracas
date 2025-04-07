"use server";

import { redirect } from "next/navigation";

import { auth } from "../../../../lib/auth/auth";

const UserSettings = async () => {
  const session = await auth();
  const user = session?.user;
  if (!user) {
    redirect("/login");
  }
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col gap-1 overflow-auto rounded-3xl bg-gray-300/30 p-3 shadow-md">
        <h1 className="text-2xl font-bold">Configurações de usuário</h1>
      </div>
    </div>
  );
};

export default UserSettings;
