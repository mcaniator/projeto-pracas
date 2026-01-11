import UsersClient from "@/app/admin/users/usersClient";
import { fetchUsers } from "@/lib/serverFunctions/queries/user";
import { redirect } from "next/navigation";

const Protected = async () => {
  const response = await fetchUsers();
  if (response.responseInfo.statusCode !== 200) {
    redirect("/error");
  }

  return <UsersClient users={response.data.users} />;
};

export default Protected;
