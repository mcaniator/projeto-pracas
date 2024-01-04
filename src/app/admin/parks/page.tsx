import { ButtonWrapper } from "@/components/singleUse/admin/parks/buttonWrapper";
import { ParkForm } from "@/components/singleUse/admin/registration/forms/parkForm";
import { Form } from "@prisma/client";

// import { cadastrar } from "@/lib/serverActions/cadastrarLocal";

const AdminRoot = async () => {
  return (
    <div>
      <div className={"flex min-h-0 flex-grow gap-5 p-5"}>
        <div className="flex basis-3/5 flex-col gap-5 text-white">
          <div className={"flex basis-1/5 flex-col gap-1 rounded-3xl bg-gray-300/30 p-3 shadow-md"}>
            <h3 className={"text-2xl font-semibold"}>Busca de Locais</h3>
            <ParkForm />
          </div>
        </div>
      </div>
      {/* <div>
        <ButtonWrapper />
      </div> */}
    </div>
  );
};

export default AdminRoot;
