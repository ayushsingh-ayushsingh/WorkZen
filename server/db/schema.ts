import {
  account as accountTable,
  verification as verificationTable,
  user as userTable,
  session as sessionTable,
  organization as organizationTable,
  member as memberTable,
  invitation as invitationTable,
} from "./schema/auth-schema";

import { employeeCheckIn as employeeCheckInTable } from "./schema/checkIn";

import { payments as paymentsTable } from "./schema/payments";
import { files as filesTable } from "./schema/files";

export const user = userTable;
export const session = sessionTable;
export const account = accountTable;
export const verification = verificationTable;
export const organization = organizationTable;
export const member = memberTable;
export const invitation = invitationTable;

export const payments = paymentsTable;

export const files = filesTable;

export const employeeCheckIn = employeeCheckInTable;
