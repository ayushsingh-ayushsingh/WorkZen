import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { client } from "@/lib/hono-client";
import { Check, Plane, RefreshCcw, UserRound, X } from "lucide-react";
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
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

function DashboardHome() {
  const [membersList, setMembersList] = useState<any[]>([]);
  const [orgId, setOrgId] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState("");

  useEffect(() => {
    getOrganizationMembersByUserId();
    init();
  }, []);

  const getOrganizationMembersByUserId = async () => {
    try {
      const user = await authClient.getSession();
      if (!user.data) {
        toast.error("Try logging in again!");
        return [];
      }

      const res = await client.api["organisation-members-by-user-id"].$post({
        json: { userId: user.data.user.id },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.data?.members) {
          setOrgId(data.data.id);
          setMembersList(data.data.members);
          return data.data.members;
        }
      }
    } catch (error) {
      console.error("Failed to fetch organization:", error);
    }
    return [];
  };

  const AddNewUserDialog = ({ organizationId }: { organizationId: string }) => {
    const [values, setValues] = useState({
      name: "",
      email: "",
      password: "",
      role: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        const user = await authClient.getSession();

        const res = await authClient.signUp.email({
          name: values.name,
          email: values.email,
          password: values.password,
        });

        const userId = res?.data?.user.id;
        const resUserId = res?.data?.user.id;

        if (!userId || !resUserId) {
          toast.success("New user created");

          await client.api["add-member"].$post({
            json: {
              userId: res?.data?.user.id,
              role: values.role,
              organizationId,
            },
          });

          await getOrganizationMembersByUserId();

          await authClient.signIn.email({
            email: user?.data?.user.email || "",
            password: "ayushsingh",
            rememberMe: true,
          });
        } else {
          toast.error(
            (res?.error?.message as string) ||
              "User creation failed. Please try again."
          );
        }
      } catch (err) {
        console.error(err);
        toast.error("An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button>Add New Employee</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[450px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user and assign a role in your organization.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-3">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={values.name}
                  onChange={(e) =>
                    setValues({ ...values, name: e.target.value })
                  }
                  placeholder="Enter name"
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={values.email}
                  onChange={(e) =>
                    setValues({ ...values, email: e.target.value })
                  }
                  placeholder="Enter email"
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={values.password}
                  onChange={(e) =>
                    setValues({ ...values, password: e.target.value })
                  }
                  placeholder="Set a password"
                  required
                />
              </div>

              <div className="grid gap-3">
                <Label>Role</Label>
                <RadioGroup
                  value={values.role}
                  onValueChange={(value) =>
                    setValues({ ...values, role: value })
                  }
                  className="grid grid-cols-2 gap-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="member" id="member" />
                    <Label htmlFor="member">Member</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="payrollManager"
                      id="payrollManager"
                    />
                    <Label htmlFor="payrollManager">Payroll Manager</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="admin" id="admin" />
                    <Label htmlFor="admin">Admin</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="owner" id="owner" />
                    <Label htmlFor="owner">Owner</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const fetchMemberStatuses = async (membersList: any[]) => {
    try {
      const updatedMembers = await Promise.all(
        membersList.map(async (member: any) => {
          try {
            const res = await client.api["attendance-status"][":userId"].$get({
              param: { userId: member.user?.id },
            });
            const data = await res.json();

            if (data.success) {
              return {
                ...member,
                status: data.memberStatus ?? "ABSENT",
              };
            }
          } catch (err) {
            console.error(`Error fetching status for ${member.user?.id}:`, err);
            return {
              ...member,
              status: "ERROR",
            };
          }
        })
      );

      setMembersList(updatedMembers);

      const session = await authClient.getSession();
      if (!session.data) {
        toast.error("Try logging in again!");
        return;
      }

      const userData = session.data.user;

      const userRole = updatedMembers.find(
        (member) => member.user?.id === userData.id
      );
      setCurrentUserRole(userRole.role);
    } catch (error) {
      console.error("Error fetching member statuses:", error);
      toast.error("Failed to update member statuses");
    }
  };

  const init = async () => {
    const members = await getOrganizationMembersByUserId();
    if (members?.length) await fetchMemberStatuses(members);
  };

  return (
    <div className="space-y-6 p-4">
      {(currentUserRole === "admin" || currentUserRole === "owner") && (
        <div className="flex justify-between">
          <AddNewUserDialog organizationId={orgId} />
          <Button size={"icon-lg"} onClick={init}>
            <RefreshCcw />
          </Button>
        </div>
      )}
      <div className="w-full h-full grid lg:grid-cols-2 xl:grid-cols-4 sm:grid-cols-2 gap-4 grid-cols-1 ">
        {membersList.map((member) => {
          return (
            <Dialog>
              <DialogTrigger asChild>
                <Card className="w-full max-w-sm" key={member.user?.id}>
                  <CardHeader>
                    <CardTitle>{member.user?.name}</CardTitle>
                    <CardDescription>{member.user?.email}</CardDescription>
                    <CardAction>
                      {member.status === "PRESENT" && (
                        <div className="rounded-full w-8 h-8 flex items-center justify-center text-background bg-primary">
                          <Check />
                        </div>
                      )}
                      {member.status === "ABSENT" && (
                        <div className="rounded-full bg-yellow-400 w-8 h-8 flex items-center justify-center text-background">
                          <X />
                        </div>
                      )}
                      {member.status === "LEAVE" && (
                        <div className="rounded-full bg-blue-400 w-8 h-8 flex items-center justify-center text-background">
                          <Plane />
                        </div>
                      )}
                    </CardAction>
                  </CardHeader>
                  <CardContent>
                    {member.user?.image ? (
                      <img
                        src={member.user?.image}
                        alt={member.user?.name + "Avatar"}
                        className="w-full aspect-square object-cover mx-auto rounded-lg"
                      />
                    ) : (
                      <UserRound
                        className="size-40 mx-auto w-full h-full"
                        strokeWidth={0.6}
                      />
                    )}
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>User Details</DialogTitle>
                  <DialogDescription>
                    More details of the selected user.
                  </DialogDescription>
                </DialogHeader>
                <Card className="w-full max-w-sm" key={member.user?.id}>
                  <CardHeader>
                    <CardTitle>{member.user?.name}</CardTitle>
                    <CardDescription>{member.user?.email}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {member.user?.image ? (
                      <img
                        src={member.user?.image}
                        alt={member.user?.name + "Avatar"}
                        className="w-full aspect-square object-cover mx-auto rounded-lg"
                      />
                    ) : (
                      <UserRound className="size-40 mx-auto" />
                    )}
                    <div className="space-y-2 mt-4">
                      <CardTitle>User Id</CardTitle>
                      <CardDescription>{member.user?.id}</CardDescription>
                      <CardTitle>Role</CardTitle>
                      <CardDescription>{member.role}</CardDescription>
                      <CardTitle>Joined At</CardTitle>
                      <CardDescription>
                        {new Date(member.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </CardContent>
                </Card>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit">Save changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          );
        })}
      </div>
    </div>
  );
}

export default DashboardHome;
