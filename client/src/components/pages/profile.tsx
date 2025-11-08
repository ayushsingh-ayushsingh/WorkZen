import ProfileUpdateForm from "@/components/layouts/profileUpdateForm";
import ProfilePageTabs from "@/components/layouts/profilePageTabs";

export default function ProfilePage() {
  return (
    <div className="h-full w-full">
      <ProfileUpdateForm />
      <ProfilePageTabs />
    </div>
  );
}
