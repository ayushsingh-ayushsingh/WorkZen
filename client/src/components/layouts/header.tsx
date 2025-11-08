import { Logo } from "@/components/layouts/logo";
import { Menu, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const menuItems = [
  { name: "Features", href: "#features" },
  { name: "Solution", href: "#solution" },
  { name: "About", href: "https://www.github.com/ayushsingh-ayushsingh" },
];

export const HeroHeader = () => {
  const navigate = useNavigate();

  const [menuState, setMenuState] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<
    | {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        emailVerified: boolean;
        name: string;
        image?: string | null | undefined;
      }
    | undefined
  >();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionData = await authClient.getSession();
        if (sessionData.data?.session) {
          setIsAuthenticated(true);
        }
        setUserData(sessionData.data?.user);
      } catch (error) {
        console.error(`Error:`, error);
      }
    };
    checkSession();
  }, []);

  return (
    <header>
      <nav
        data-state={menuState && "active"}
        className="fixed z-20 w-full px-2"
      >
        <div
          className={cn(
            "mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12 rounded-2xl border border-background",
            isScrolled &&
              "bg-background/50 max-w-4xl rounded-2xl border border-primary/30 backdrop-blur-lg lg:px-5"
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between lg:w-auto">
              <Link
                to="/"
                aria-label="home"
                className="flex items-center space-x-2"
              >
                <Logo />
              </Link>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState == true ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>
            </div>

            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-8 text-sm">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <a
                      href={item.href}
                      className="text-muted-foreground hover:text-accent-foreground block duration-150"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <a
                        href={item.href}
                        className="text-muted-foreground hover:text-accent-foreground block duration-150"
                      >
                        <span>{item.name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {!isAuthenticated ? (
                <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className={cn(isScrolled && "lg:hidden")}
                  >
                    <Link to="/login">
                      <span>Login</span>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className={cn(isScrolled && "lg:hidden")}
                  >
                    <Link to="/signup">
                      <span>Sign Up</span>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className={cn(isScrolled ? "lg:inline-flex" : "hidden")}
                  >
                    <Link to="/login">
                      <span>Get Started</span>
                    </Link>
                  </Button>
                </div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                    >
                      {userData?.image ? (
                        <img
                          src={userData.image}
                          alt="User Profile Image"
                          className="rounded-full object-cover h-8 w-8"
                          height={512}
                          width={512}
                        />
                      ) : (
                        <UserRound />
                      )}
                      <span className="sr-only">User Dropdown</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
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
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      Profile
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
