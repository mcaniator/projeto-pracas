/* eslint-disable @typescript-eslint/no-unsafe-return */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-unsafe-call */
import { pretty, render } from "@react-email/render";

import InviteEmail from "../packages/transactional/emails/InviteEmail";
import PasswordResetEmail from "../packages/transactional/emails/PasswordResetEmail";

const getInviteEmail = async ({ registerLink }: { registerLink: string }) => {
  const html = await pretty(
    await render(<InviteEmail registerLink={registerLink} />),
  );
  return html;
};

const getPasswordResetEmail = async ({
  passwordResetLink,
}: {
  passwordResetLink: string;
}) => {
  const html = await pretty(
    await render(<PasswordResetEmail passwordResetLink={passwordResetLink} />),
  );
  return html;
};

export { getInviteEmail, getPasswordResetEmail };
