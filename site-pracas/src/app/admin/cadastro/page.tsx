import { ProfileForm } from "@/components/categoryForm";
import { QuestionForm } from "@/components/questionForm";

{
  /* <div>
  {data.map((form: JSONSchema, index) => {
    return (
      <div key={index}>
        {form.FormsFields.map((formInfo, index) => {
          console.log(formInfo);
          return (
            <p key={index}>
              {formInfo.id} {formInfo.optional}
            </p>
          );
        })}
      </div>
    );
  })}
</div>; */
}

const AdminRoot = async () => {
  interface JSONSchema {
    id: number;
    name: string;
    FormsFields: [
      {
        id: number;
        name: string;
        optional: boolean;
        NumericField: null | {
          min: number;
          max: number;
        };
        TextField: null | {
          id: number;
        };
        OptionField: null | {
          id: number;
          total_options: number;
          option_limit: number;
          visual_preference: number;
          Options: [
            {
              id: number;
              name: string;
            },
          ];
        };
      },
    ];
  }

  const data: JSONSchema[] = await fetch(
    "http://localhost:3333/form_field/category",
  ).then((response) => {
    return response.json();
  });

  return (
    <main className="flex">
      <div className="flex flex-col">
        <h2>Criação de Componente</h2>
        <div className="flex flex-col">
          <div>
            <ProfileForm />
          </div>
          <div>
            <QuestionForm />
          </div>
        </div>
      </div>
      <div></div>
    </main>
  );
};

export default AdminRoot;
