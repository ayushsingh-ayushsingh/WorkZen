import { client } from "@/lib/hono-client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const Settings = () => {
  const [membersList, setMembersList] = useState<any[]>([]);
  const [organizationId, setOrganizationId] = useState("");
  const [loadingRoles, setLoadingRoles] = useState<string | null>(null);

  useEffect(() => {
    getMembersOrganizationByUserId();
  }, []);

  const getMembersOrganizationByUserId = async () => {
    try {
      const user = await authClient.getSession();
      if (!user.data) {
        toast.error("Try logging in again!");
        return;
      }

      const res = await client.api["organisation-members-by-user-id"].$post({
        json: { userId: user.data.user.id },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.data?.members) {
          setMembersList(data.data.members);
          setOrganizationId(data.data.members[0].organizationId);
        }
      }
    } catch (error) {
      console.error("Failed to fetch organization:", error);
      toast.error("Failed to fetch organization members");
    }
  };

  const updateMemberRole = async (memberId: string, role: string) => {
    try {
      setLoadingRoles(memberId);
      const res = await authClient.organization.updateMemberRole({
        role,
        memberId,
        organizationId,
      });

      if (res.data) {
        setMembersList((prev) =>
          prev.map((m) => (m.id === memberId ? { ...m, role } : m))
        );

        toast.success("Role updated successfully!");
      } else {
        toast.success(`Error: ${res.error.message}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update role");
    } finally {
      setLoadingRoles(null);
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
            <TableHead>User Id</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Joined At</TableHead>
            <TableHead>Update Role</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {membersList.length > 0 ? (
            membersList.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">
                  <div className="max-w-24 truncate">{member.user?.id}</div>
                </TableCell>
                <TableCell className="font-medium">
                  {member.user?.name}
                </TableCell>
                <TableCell>{member.user?.email}</TableCell>
                <TableCell>
                  {new Date(member.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Select
                    value={member.role || ""}
                    onValueChange={(newRole) =>
                      updateMemberRole(member.id, newRole)
                    }
                    disabled={loadingRoles === member.id}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue
                        placeholder={
                          loadingRoles === member.id
                            ? "Updating..."
                            : "Select Role"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Roles</SelectLabel>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="payrollManager">
                          Payroll Manager
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No members found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default Settings;
