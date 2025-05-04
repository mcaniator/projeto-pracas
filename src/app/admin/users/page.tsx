import { redirect } from "next/navigation";

import { auth } from "../../../lib/auth/auth";
import { checkIfHasAnyPermission } from "../../../serverOnly/checkPermission";
import UsersClient from "./usersClient";

const Users = async () => {
  const session = await auth();
  try {
    await checkIfHasAnyPermission(session?.user.id, ["USER_MANAGER"]);
  } catch (e) {
    redirect("/admin?permissionDenied=true");
  }

  return (
    <div className="flex h-full w-full gap-5">
      <div className="flex h-full w-full flex-col gap-1 overflow-auto rounded-3xl bg-gray-300/30 p-3 shadow-md">
        <UsersClient />
      </div>
    </div>
  );
};

export default Users;
