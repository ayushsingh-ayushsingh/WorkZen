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
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Fruits</SelectLabel>
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
              <TableCell colSpan={4} className="text-center">
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
