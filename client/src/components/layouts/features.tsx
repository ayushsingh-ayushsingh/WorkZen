import {
  Cpu,
  Fingerprint,
  Pencil,
  Settings2,
  Sparkles,
  Zap,
} from "lucide-react";

export default function Features() {
  return (
    <section className="py-12 md:py-20" id="features">
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
        <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
          <h2 className="text-balance text-4xl font-medium lg:text-5xl">
            Everything You Need for Modern HR Management
          </h2>
          <p>
            Manage employees, attendance, leaves, and payroll all in one place.
            Efficient, secure, and easy to use — designed for HR, Admins,
            Payroll Managers, and Employees.
          </p>
        </div>

        <div className="relative mx-auto grid max-w-4xl border rounded-2xl *:p-12 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="size-4" />
              <h3 className="text-sm font-medium">Faaast</h3>
            </div>
            <p className="text-sm">
              It supports an entire helping developers and innovate.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Cpu className="size-4" />
              <h3 className="text-sm font-medium">Powerful</h3>
            </div>
            <p className="text-sm">
              It supports an entire helping developers and businesses.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Fingerprint className="size-4" />

              <h3 className="text-sm font-medium">Security</h3>
            </div>
            <p className="text-sm">
              It supports an helping developers businesses.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Pencil className="size-4" />

              <h3 className="text-sm font-medium">Customization</h3>
            </div>
            <p className="text-sm">
              It supports helping developers and businesses innovate.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Settings2 className="size-4" />

              <h3 className="text-sm font-medium">Control</h3>
            </div>
            <p className="text-sm">
              It supports helping developers and businesses innovate.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4" />

              <h3 className="text-sm font-medium">Built for you</h3>
            </div>
            <p className="text-sm">
              It supports helping developers and businesses innovate.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
