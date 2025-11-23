import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Streak • Sui-powered daily check-ins" },
    {
      name: "description",
      content: "Authenticate with your Sui wallet, keep your streak alive, and earn hero points on the Streak leaderboard.",
    },
  ];
}

export default function Home() {
  return <Welcome />;
}
