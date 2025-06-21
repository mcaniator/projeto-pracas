/* eslint-disable @typescript-eslint/no-unsafe-return */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-unsafe-call */
import { pretty, render } from "@react-email/render";

import { InviteEmail } from "../packages/transactional/emails/InviteEmail";

const getInviteEmail = async ({ registerLink }: { registerLink: string }) => {
  const html = await pretty(
    await render(<InviteEmail registerLink={registerLink} />),
  );
  return html;
};

export { getInviteEmail };
