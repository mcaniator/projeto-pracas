import SubmitButton from "./submitButton";
import { categorySubmit } from "./submition";

export function ProfileForm() {
  return (
    <form action={categorySubmit}>
      <input type="text" name="name" />
      <SubmitButton />
    </form>
  );
}
