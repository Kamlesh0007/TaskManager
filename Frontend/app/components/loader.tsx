import { Loader as Loader2} from "lucide-react";

export const Loader = () => {
  return (
    <div className="flex  items-center justify-center h-full mt-6">
      <Loader2 className="w-10 h-10 animate-spin" color="#033a1b" />
    </div>
  );
};