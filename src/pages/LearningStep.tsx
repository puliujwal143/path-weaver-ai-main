import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import StepContent from "@/components/StepContent";

export default function LearningStep() {
  const { pathId, stepId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();

  const [step, setStep] = useState<any>(null);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (stepId) init();
  }, [stepId]);

  const init = async () => {
    setLoading(true);

    const { data: stepData } = await supabase
      .from("path_steps")
      .select("*")
      .eq("id", stepId)
      .single();

    setStep(stepData);

    const { data: existing } = await supabase
      .from("step_resources")
      .select("*")
      .eq("step_id", stepId);

    if (existing?.length) {
      setResources(existing);
      setLoading(false);
      return;
    }

    await fetch(
      `${import.meta.env.VITE_EDGE_BASE_URL}/generate-step-content`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stepId }),
      }
    );

    const { data } = await supabase
      .from("step_resources")
      .select("*")
      .eq("step_id", stepId);

    setResources(data ?? []);
    setLoading(false);
  };

  const markCompleted = async () => {
    setSaving(true);

    await supabase
      .from("path_steps")
      .update({ status: "completed" })
      .eq("id", stepId);

    const { data: steps } = await supabase
      .from("path_steps")
      .select("status")
      .eq("path_id", pathId);

    const completed =
      steps?.filter((s) => s.status === "completed").length ?? 0;

    const progress = Math.round(
      (completed / (steps?.length ?? 1)) * 100
    );

    await supabase
      .from("learning_paths")
      .update({ progress_percentage: progress })
      .eq("id", pathId);

    toast({ title: "Step completed 🎉" });
    navigate(`/path/${pathId}`);
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-10">
      <div>
        <p className="text-sm uppercase tracking-wide text-muted-foreground">
          Learning Step
        </p>
        <h1 className="text-4xl font-bold">{step.title}</h1>
        <p className="text-lg text-muted-foreground">
          {step.description}
        </p>
      </div>

      <StepContent
        resources={resources}
        preferredFormat={step.preferred_format}
      />

      <Button
        size="lg"
        className="w-full text-lg py-6"
        disabled={saving}
        onClick={markCompleted}
      >
        {saving ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <Check className="mr-2 h-5 w-5" />
        )}
        Mark as Done
      </Button>
    </div>
  );
}