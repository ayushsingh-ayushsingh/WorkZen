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
import { employeeAttendance as employeeAttendanceTable } from "./schema/attendance";

import { payments as paymentsTable } from "./schema/payments";
import { files as filesTable } from "./schema/files";
import { relations } from "drizzle-orm";
import { resume as resumeTable } from "./schema/resume";
import { privateBankInfo as privatebankInfoTable } from "./schema/privateBankInfo";

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

export const employeeAttendance = employeeAttendanceTable;

export const resume = resumeTable;
export const privateBankInfo = privatebankInfoTable;

export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(member),
}));

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
}));
