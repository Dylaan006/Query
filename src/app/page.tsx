import Dashboard from "@/components/Dashboard";
import { getTasks } from "./actions";

// Force dynamic rendering to prevent caching issues with tasks
export const dynamic = 'force-dynamic';

export default async function Home() {
  const initialTasks = await getTasks();
  console.log("Server Component Tasks Count:", initialTasks.length);

  return (
    <Dashboard initialTasks={initialTasks} />
  );
}
