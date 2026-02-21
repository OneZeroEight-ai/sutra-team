import { redirect } from "next/navigation";

/**
 * /dashboard redirects to the static dashboard.html
 * which is the white-labeled sammasuit.com dashboard.
 */
export default function DashboardPage() {
  redirect("/dashboard.html");
}
