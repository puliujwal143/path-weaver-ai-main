import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";

export default function Generate() {
  const [status, setStatus] = useState("Initializing AI...");
  const location = useLocation();
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const { toast } = useToast();

  const hasStarted = useRef(false); // ⬅ prevents double execution

  const { preferenceId, formData } = (location.state || {}) as any;

  useEffect(() => {
    if (!preferenceId || !formData || !user || !session) {
      navigate("/onboarding");
      return;
    }

    // Prevent React StrictMode double-call
    if (hasStarted.current) return;
    hasStarted.current = true;

    generatePath();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferenceId, user, session]);

  const generatePath = async () => {
    try {
      console.log("Calling generate-path function");

      if (!session?.access_token) {
        throw new Error("No active session");
      }

      setStatus("Analyzing your learning preferences...");
      await new Promise((r) => setTimeout(r, 800));

      setStatus("Designing your personalized learning path...");

      const EDGE_BASE_URL = import.meta.env.VITE_EDGE_BASE_URL;
      if (!EDGE_BASE_URL) {
        throw new Error("Edge function base URL not configured");
      }

      const response = await fetch(
        `${EDGE_BASE_URL}/generate-path`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            preferenceId,
            topic: formData.topic,
            skillLevel: formData.skillLevel,
            learningGoal: formData.learningGoal,
            preferredFormat: formData.preferredFormat,
            hoursPerDay: Number(formData.hoursPerDay),
            daysPerWeek: Number(formData.daysPerWeek),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          `Status ${response.status}: ${JSON.stringify(data)}`
        );
      }

      toast({
        title: "Learning path created!",
        description: `${data.stepsCount} steps ready for you`,
      });

      navigate(`/path/${data.pathId}`);
    } catch (error) {
      console.error("Generation error:", error);

      toast({
        variant: "destructive",
        title: "Generation failed",
        description:
          error instanceof Error ? error.message : "Please try again",
      });

      navigate("/onboarding");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl animate-pulse" />
      </div>

      <Card className="relative w-full max-w-md border-border/50 shadow-lg">
        <CardContent className="flex flex-col items-center space-y-6 p-8 text-center">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-10 w-10 text-primary animate-pulse" />
            </div>
            <Loader2 className="absolute -bottom-1 -right-1 h-8 w-8 animate-spin text-primary" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">
              Creating Your Learning Path
            </h2>
            <p className="text-muted-foreground">{status}</p>
          </div>

          <div className="w-full space-y-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
            </div>
            <p className="text-xs text-muted-foreground">
              This may take a moment...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
