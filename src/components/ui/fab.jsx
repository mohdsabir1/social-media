import { Plus } from "lucide-react";
import { Button } from "./button";

export function FloatingActionButton({ onClick }) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-indigo-600 hover:bg-indigo-700 p-0"
    >
      <Plus className="h-6 w-6" />
      <span className="sr-only">Add new post</span>
    </Button>
  );
}
