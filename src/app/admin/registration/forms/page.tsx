import { FormForm } from "@/components/singleUse/admin/registration/forms/formForm";

const AdminFormsPage = () => {
  return (
    <div className={"flex min-h-0 flex-grow gap-5 p-5"}>
      <div className="flex basis-3/5 flex-col gap-5 text-white">
        <div className={"flex basis-1/5 flex-col gap-1 rounded-3xl bg-gray-300/30 p-3 shadow-md"}>
          <h3 className={"text-2xl font-semibold"}>Criação de Formulários</h3>
          <FormForm />
        </div>
      </div>
    </div>
  );
};

export default AdminFormsPage;
