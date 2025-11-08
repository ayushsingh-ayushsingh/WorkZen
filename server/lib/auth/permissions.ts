import { createAccessControl } from "better-auth/plugins/access";

const statement = {
  project: ["create", "share", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

const member = ac.newRole({
  project: ["create"],
});

const admin = ac.newRole({
  project: ["create", "update"],
});

const owner = ac.newRole({
  project: ["create", "update", "delete"],
});

const payrollOfficer = ac.newRole({
  project: ["create", "update", "delete"],
});

export { admin, owner, member, payrollOfficer };
