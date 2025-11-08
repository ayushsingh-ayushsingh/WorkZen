import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "../ui/textarea";
import { Link } from "react-router-dom";
import { client } from "@/lib/hono-client";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export default function ProfilePageTabs() {
  const [about, setAbout] = useState("");
  const [skills, setSkills] = useState("");
  const [certifications, setCertifications] = useState("");
  const [loading, setLoading] = useState(false);

  const [resumeFetching, setResumeFetching] = useState(true);
  const [infoFetching, setInfoFetching] = useState(true);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        setResumeFetching(true);
        const user = await authClient.getSession();
        if (!user.data) {
          toast.error("Try logging in again!");
          return;
        }

        const res = await client.api["get-resume"][":userId"].$get({
          param: { userId: user.data.user.id },
        });

        if (!res.ok) return;
        const data = await res.json();

        if (data.success && data.data) {
          setAbout(data.data.about || "");
          setSkills(data.data.skills || "");
          setCertifications(data.data.certifications || "");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load resume.");
      } finally {
        setResumeFetching(false);
      }
    };

    fetchResume();
  }, []);

  const handleResumeSave = async () => {
    try {
      setLoading(true);

      const user = await authClient.getSession();
      if (!user.data) {
        toast.error("Try logging in again!");
        return;
      }

      const res = await client.api["save-resume"].$post({
        json: {
          userId: user.data.user.id,
          about,
          skills,
          certifications,
        },
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Resume saved successfully!");
      } else {
        toast.error(data.error || "Failed to save resume");
      }
    } catch (err: any) {
      console.error("Error saving resume:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    dob: "",
    address: "",
    nationality: "",
    email: "",
    gender: "",
    maritalStatus: "",
    joiningDate: "",
    accountNumber: "",
    bankName: "",
    ifsc: "",
    pan: "",
    uan: "",
    empCode: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setInfoFetching(true);
        const user = await authClient.getSession();
        if (!user.data) {
          toast.error("Try logging in again!");
          return;
        }

        const res = await client.api["get-private-bank-info"][":userId"].$get({
          param: { userId: user.data.user.id },
        });
        if (!res.ok) return;

        const data = await res.json();
        if (data.success && data.data) {
          setFormData({
            ...formData,
            ...Object.fromEntries(
              Object.entries(data.data).map(([key, value]) => [
                key,
                value ?? "",
              ])
            ),
          });
        }
      } catch (err) {
        console.error("Error fetching private/bank info:", err);
      } finally {
        setInfoFetching(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const user = await authClient.getSession();
      if (!user.data) {
        toast.error("Try logging in again!");
        return;
      }

      const res = await client.api["save-private-bank-info"].$post({
        json: { userId: user.data.user.id, ...formData },
      });

      if (res.ok) toast.success("Information saved!");
      else toast.error("Failed to save info");
    } catch (err: any) {
      console.error("Error saving info:", err);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };


  if (resumeFetching || infoFetching) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Loading profile data...
      </p>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6 py-1">
      <Tabs defaultValue="resume">
        <TabsList>
          <TabsTrigger value="resume">Resume</TabsTrigger>
          <TabsTrigger value="private">Private Info</TabsTrigger>
          <TabsTrigger value="salary">Salary Info</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        <TabsContent value="resume">
          <Card>
            <CardHeader>
              <CardTitle>Resume</CardTitle>
              <CardDescription>
                Make changes to your resume here. Click save when you&apos;re
                done.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-6">
              <div className="w-1/2 space-y-6">
                <div className="grid gap-3">
                  <Label htmlFor="about">About</Label>
                  <Textarea
                    id="about"
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    className="h-120"
                  />
                </div>
              </div>

              <div className="w-1/2 space-y-6">
                <div className="grid gap-3">
                  <Label htmlFor="skills">Skills</Label>
                  <Textarea
                    id="skills"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="h-70"
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="certifications">Certifications</Label>
                  <Textarea
                    id="certifications"
                    value={certifications}
                    onChange={(e) => setCertifications(e.target.value)}
                    className="h-37"
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button onClick={handleResumeSave} disabled={loading}>
                {loading ? "Saving..." : "Save changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="salary">
          <Card className="mx-auto">
            <CardHeader>
              <CardTitle>Salary Info</CardTitle>
              <CardDescription>
                See your salary info here. All fields are read-only.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Month Wage</Label>
                  <Input type="text" value="50,000" disabled />
                </div>
                <div className="grid gap-2">
                  <Label>Yearly Wage</Label>
                  <Input type="text" value="600,000" disabled />
                </div>
              </div>

              {/* Number of working days */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>No of working days in a week</Label>
                  <Input type="text" value="5" disabled />
                </div>
                <div className="grid gap-2">
                  <Label>Break Time (hrs)</Label>
                  <Input type="text" value="1" disabled />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Salary Components */}
                <Card className="border-gray-600">
                  <CardHeader>
                    <CardTitle>Salary Components</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    {[
                      { label: "Basic Salary", value: "25,000 / month" },
                      {
                        label: "House Rent Allowance",
                        value: "12,500 / month",
                      },
                      { label: "Standard Allowance", value: "4,167 / month" },
                      { label: "Performance Bonus", value: "2,082 / month" },
                      {
                        label: "Leave Travel Allowance",
                        value: "2,082 / month",
                      },
                      { label: "Fixed Allowance", value: "2,918 / month" },
                    ].map((item, idx) => (
                      <div key={idx} className="grid gap-4">
                        <Label>{item.label}</Label>
                        <Input type="text" value={item.value} disabled />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* PF & Tax */}
                <Card className="border-gray-600">
                  <CardHeader>
                    <CardTitle>Provident Fund (PF) & Tax Deductions</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    {[
                      { label: "PF Employee", value: "3,000 / month" },
                      { label: "PF Employer", value: "3,000 / month" },
                      { label: "Professional Tax", value: "200 / month" },
                    ].map((item, idx) => (
                      <div key={idx} className="grid gap-4">
                        <Label>{item.label}</Label>
                        <Input type="text" value={item.value} disabled />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="private">
          <Card>
            <CardHeader>
              <CardTitle>Private & Bank Information</CardTitle>
              <p className="text-sm text-muted-foreground">
                Update your personal and bank details below.
              </p>
            </CardHeader>

            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Private Info */}
              <div className="grid gap-4">
                {[
                  { id: "dob", label: "Date of Birth", type: "date" },
                  { id: "address", label: "Residing Address", type: "text" },
                  { id: "nationality", label: "Nationality", type: "text" },
                  { id: "email", label: "Personal Email", type: "email" },
                  { id: "gender", label: "Gender", type: "text" },
                  {
                    id: "maritalStatus",
                    label: "Marital Status",
                    type: "text",
                  },
                  { id: "joiningDate", label: "Date of Joining", type: "date" },
                ].map(({ id, label, type }) => (
                  <div key={id} className="grid gap-1">
                    <Label htmlFor={id}>{label}</Label>
                    <Input
                      id={id}
                      type={type}
                      value={formData[id as keyof typeof formData] || ""}
                      onChange={handleChange}
                    />
                  </div>
                ))}
              </div>

              {/* Bank Info */}
              <div className="grid gap-4">
                {[
                  { id: "accountNumber", label: "Account Number" },
                  { id: "bankName", label: "Bank Name" },
                  { id: "ifsc", label: "IFSC Code" },
                  { id: "pan", label: "PAN No" },
                  { id: "uan", label: "UAN No" },
                  { id: "empCode", label: "Employee Code" },
                ].map(({ id, label }) => (
                  <div key={id} className="grid gap-1">
                    <Label htmlFor={id}>{label}</Label>
                    <Input
                      id={id}
                      type="text"
                      value={formData[id as keyof typeof formData] || ""}
                      onChange={handleChange}
                    />
                  </div>
                ))}
              </div>
            </CardContent>

            <CardFooter>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : "Save Information"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Forgot Password / Change Password</CardTitle>
              <CardDescription>Change your password here.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild>
                <Link to="/forgot-password">Change password</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
