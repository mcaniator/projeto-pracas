import Form from "@/components/singleUse/authForm";

const Page = () => {
  return (
    <>
      <h1>Sign up</h1>
      <Form action="/api/signup">
        <label htmlFor="username">Username</label>
        <input name="username" id="username" />
        <br />
        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" />
        <br />
        <input type="submit" />
      </Form>
    </>
  );
};

export default Page;
