import { client } from "@/lib/hono-client";
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
import { Button } from "../ui/button";
import { RefreshCcw } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CreatePayrollReport() {
  const [membersList, setMembersList] = useState<any[]>([]);
  const [_orgId, setOrgId] = useState("");
  const [ctcValues, setCtcValues] = useState<Record<string, string>>({});

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
          json: { userId: user.data.user.id },
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

  const handleCtcChange = (memberId: string, value: string) => {
    setCtcValues((prev) => ({ ...prev, [memberId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent, member: any) => {
    e.preventDefault();
    await client.api.payroll.$post({
      json: {
        userId: member.id,
        name: member.user?.name,
        role: member.role,
        email: member.user?.email,
        joinedAt: member.createdAt,
        ctc: parseInt(ctcValues[member.id] || "0", 10),
      },
    });
    toast.success("CTC updated!");
  };

  return (
    <div className="p-6">
      <div className="w-full flex justify-end">
        <Button onClick={getMembersOrganizationByUserId}>
          <RefreshCcw />
        </Button>
      </div>
      <Table className="w-full mx-auto">
        <TableCaption>
          A list of all the members in your organization.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined At</TableHead>
            <TableHead>Create</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {membersList.length > 0 ? (
            membersList.map((member) => (
              <TableRow key={member.user?.id}>
                <TableCell className="font-medium">
                  {member.user?.name}
                </TableCell>
                <TableCell>{member.user?.email}</TableCell>
                <TableCell>{member.role}</TableCell>
                <TableCell>
                  {new Date(member.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Dialog>
                    <form onSubmit={(e) => handleSubmit(e, member)}>
                      <DialogTrigger asChild>
                        <Button variant="outline">Create</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Cost to company</DialogTitle>
                          <DialogDescription>
                            What is the cost to company for selected employee.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4">
                          <div className="grid gap-3">
                            <Label htmlFor={`ctc-${member.id}`}>
                              Cost to Company
                            </Label>
                            <Input
                              id={`ctc-${member.id}`}
                              type="number"
                              value={ctcValues[member.user.id] || ""}
                              onChange={(e) => {
                                handleCtcChange(member.user.id, e.target.value);
                              }}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button
                            type="submit"
                            onClick={async (e) => {
                              e.preventDefault();

                              const res = await client.api.payroll.$post({
                                json: {
                                  userId: member.user?.id,
                                  name: member.user?.name,
                                  role: member.role,
                                  email: member.user?.email,
                                  joinedAt: member.createdAt,
                                  ctc: parseInt(
                                    ctcValues[member.user.id] || "0",
                                    10
                                  ),
                                },
                              });

                              if (res.ok) {
                                toast.success("CTC saved!");
                              } else {
                                toast.error("Failed to save CTC");
                              }
                            }}
                          >
                            Save changes
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </form>
                  </Dialog>
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
}
