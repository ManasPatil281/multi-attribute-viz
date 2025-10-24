import { DashboardLayout } from "@/components/dashboard-layout"

export default function EnhancedLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>
}
