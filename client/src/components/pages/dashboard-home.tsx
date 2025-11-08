import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Plane, X } from "lucide-react";

function DashboardHome() {
  const user = {
    employeeName: "Ayush Singh",
    employeeEmail: "ayushpno@gmail.com",
    status: "LEAVE",
  };
  return (
    <div className="space-y-6 p-4">
      <Button>New Employee</Button>
      <div className="w-full h-full grid lg:grid-cols-2 xl:grid-cols-4 sm:grid-cols-2 gap-4 grid-cols-1">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>{user.employeeName}</CardTitle>
            <CardDescription>{user.employeeEmail}</CardDescription>
            <CardAction>
              {user.status === "PRESENT" && (
                <Button className="rounded-full" size={"icon"}>
                  <Check />
                </Button>
              )}
              {user.status === "ABSENT" && (
                <Button className="rounded-full bg-yellow-400" size={"icon"}>
                  <X />
                </Button>
              )}
              {user.status === "LEAVE" && (
                <Button className="rounded-full bg-blue-400" size={"icon"}>
                  <Plane />
                </Button>
              )}
            </CardAction>
          </CardHeader>
          <CardContent>
            <img
              src="https://cdn.pixabay.com/photo/2025/01/27/20/18/wheat-9364066_640.jpg"
              alt={user.employeeName + "Avatar"}
              className="w-full aspect-square object-cover mx-auto rounded-lg"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// function DashboardHome() {
//   return (
//     <div className="space-y-12">
//       <Chart />
//       <TableComponent />
//       <SimpleTable />
//     </div>
//   );
// }

export default DashboardHome;
