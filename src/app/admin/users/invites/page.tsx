import InvitesClient from "./invitesClient";

const Invites = () => {
  return (
    <div className="flex h-full w-full gap-5">
      <div className="flex h-full w-full flex-col gap-1 overflow-auto rounded-3xl bg-gray-300/30 p-3 shadow-md">
        <InvitesClient />
      </div>
    </div>
  );
};

export default Invites;
