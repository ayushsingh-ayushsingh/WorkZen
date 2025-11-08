import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const navigate = useNavigate();
  return (
    <div className="w-full flex items-center justify-center h-full">
      <Button
        onClick={async () => {
          try {
            await authClient.signOut();
            toast.success("Logged out successfully.");
            navigate("/login");
          } catch (error) {
            console.error(error);
            toast.error(`Error: ${error}`);
          }
        }}
      >
        Logout
      </Button>
    </div>
  );
}
