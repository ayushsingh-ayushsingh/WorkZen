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

export default function Timeoff() {
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
      <div className="max-w-5xl mx-auto grid grid-cols-2 gap-4 my-6">
        <div className="text-center bg-muted p-4 rounded-lg">
          <div className="text-muted-foreground font-bold">Paid Time Off</div>
          <div className="text-3xl">24 Days</div>
        </div>
        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="text-muted-foreground font-bold">Sick Time Off</div>
          <div className="text-3xl">7 Days</div>
        </div>
      </div>
      <Table className="max-w-5xl w-full mx-auto">
        <TableCaption>
          A list of all the members in your organization.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Time Off Type</TableHead>
            <TableHead>Status</TableHead>
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
                <TableCell>
                  {new Date(member.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(member.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(member.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(member.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="space-x-2">
                  <Button size={"sm"}>Approve</Button>
                  <Button variant={"destructive"} size={"sm"}>
                    Reject
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
