import { client } from "@/lib/hono-client";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default function Employees() {
  const [membersList, setMembersList] = useState<any[]>([]);
  const [orgId, setOrgId] = useState("");

  useEffect(() => {
    getMembersOrganizationByUserId();
  }, []);

  const getMembersOrganizationByUserId = async () => {
    try {
      const user = await authClient.getSession();
      if (!user.data) {
        toast.error("Try logging in again!");
      } else {
        const res = await client.api["organisation-members-by-user-id"].$post({
          json: {
            userId: user.data.user.id,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.data?.members) {
            setMembersList(data.data.members);
            setOrgId(data.data.id);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch organization:", error);
    }
  };

  return (
    <div className="p-6">
      <Table className="max-w-5xl w-full mx-auto">
        <TableCaption>
          A list of all the members in your organization.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined At</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {membersList.length > 0 ? (
            membersList.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">
                  {member.user?.name}
                </TableCell>
                <TableCell>{member.user?.email}</TableCell>
                <TableCell>{member.role}</TableCell>
                <TableCell>
                  {new Date(member.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant={"destructive"}
                    onClick={async () => {
                      const { data, error } =
                        await authClient.organization.removeMember({
                          memberIdOrEmail: member.user?.email,
                          organizationId: orgId,
                        });
                      if (data) {
                        toast.success("Removed employee successfully");
                      }
                      if (error) {
                        toast.error("Failed to remove employee / Unauthorized");
                      }
                    }}
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No members found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
