import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="text-center p-6">
      <h1 className="text-2xl font-bold mb-2">🎯</h1>
      <p className="text-muted-foreground">Your daily puzzle awaits.</p>
      <Button className="mt-4">Play Now</Button>
    </div>
  );
}
