import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { CircleArrowLeft, MoveLeft } from "lucide-react";

export const BackButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => navigate(-1)} //This is a shortcut to go back to the previous page in browser history.
      className="p-4 mr-4 mb-4"
    >
      <MoveLeft/> Back
    </Button>
  );
};