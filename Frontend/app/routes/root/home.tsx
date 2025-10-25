import { Button } from "@/components/ui/button";
import type { Route } from "../../+types/root";
import { Link } from "react-router";



export function meta({}: Route.MetaArgs) {
  return [
    { title: "TaskHub" },
    { name: "description", content: "Welcome to TaskHub!" },
  ];
}

export default function Home() {
  return <>
  <div className="w-full h-screen flex items-center justify-center gap-4">
  
  <Link to="/sign-in">
        <Button className="bg-green-800 text-white">Login</Button>
      </Link>
      <Link to="/sign-up">
        <Button variant="outline" className="bg-green-600 text-white">
          Sign Up
        </Button>
      </Link>
  </div>
  </>;
}
