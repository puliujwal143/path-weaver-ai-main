import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Check, Clock, ExternalLink, Loader2, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AIAssistant } from '@/components/AIAssistant';
import { cn } from '@/lib/utils';

interface PathStep {
  id: string;
  step_order: number;
  title: string;
  description: string | null;
  difficulty: string;
  estimated_minutes: number;
  status: string;
  step_resources?: { id: string; title: string; url: string; resource_type: string }[];
}

interface LearningPath {
  id: string;
  title: string;
  description: string | null;
  topic: string;
  progress_percentage: number;
  estimated_hours: number | null;
}

export default function PathView() {
  const { pathId } = useParams();
  const [path, setPath] = useState<LearningPath | null>(null);
  const [steps, setSteps] = useState<PathStep[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (pathId) fetchPath();
  }, [pathId]);

  const fetchPath = async () => {
    const { data: pathData } = await supabase
      .from('learning_paths')
      .select('*')
      .eq('id', pathId)
      .single();

    if (pathData) setPath(pathData);

    const { data: stepsData } = await supabase
      .from('path_steps')
      .select('*, step_resources(*)')
      .eq('path_id', pathId)
      .order('step_order');

    if (stepsData) setSteps(stepsData);
    setLoading(false);
  };

  const updateStepStatus = async (stepId: string, newStatus: string) => {
    const { error } = await supabase
      .from('path_steps')
      .update({ 
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null 
      })
      .eq('id', stepId);

    if (!error) {
      // Recalculate progress
      const completedCount = steps.filter(s => 
        s.id === stepId ? newStatus === 'completed' : s.status === 'completed'
      ).length;
      const progress = Math.round((completedCount / steps.length) * 100);

      await supabase
        .from('learning_paths')
        .update({ progress_percentage: progress })
        .eq('id', pathId);

      fetchPath();
      toast({ title: newStatus === 'completed' ? 'Step completed!' : 'Step updated' });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!path) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Path not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{path.title}</h1>
              <p className="text-muted-foreground">{path.description}</p>
            </div>
            <Badge>{path.topic}</Badge>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span className="font-medium">{path.progress_percentage}%</span>
            </div>
            <Progress value={path.progress_percentage} className="h-2" />
          </div>
        </div>
      </header>

      {/* Timeline */}
      <main className="container mx-auto px-4 py-8">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={step.id} className="relative flex gap-4">
                {/* Status indicator */}
                <div className={cn(
                  "relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 bg-background transition-all",
                  step.status === 'completed' && "border-path-completed bg-path-completed text-white",
                  step.status === 'in_progress' && "border-path-in-progress bg-path-in-progress/10",
                  step.status === 'not_started' && "border-border"
                )}>
                  {step.status === 'completed' ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.step_order}</span>
                  )}
                </div>

                {/* Step card */}
                <Card className={cn(
                  "flex-1 transition-all",
                  step.status === 'in_progress' && "border-path-in-progress shadow-md"
                )}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{step.title}</CardTitle>
                        <CardDescription className="mt-1">{step.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">{step.difficulty}</Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          {step.estimated_minutes}m
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Resources */}
                    {step.step_resources && step.step_resources.length > 0 && (
                      <div className="mb-4 space-y-2">
                        <p className="text-sm font-medium">Resources:</p>
                        <div className="flex flex-wrap gap-2">
                          {step.step_resources.map((resource) => (
                            <a
                              key={resource.id}
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs hover:bg-secondary/80"
                            >
                              {resource.title}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      {step.status === 'not_started' && (
                        <Button size="sm" onClick={() => updateStepStatus(step.id, 'in_progress')}>
                          <Play className="mr-1 h-3 w-3" />
                          Start
                        </Button>
                      )}
                      {step.status === 'in_progress' && (
                        <Button size="sm" onClick={() => updateStepStatus(step.id, 'completed')}>
                          <Check className="mr-1 h-3 w-3" />
                          Complete
                        </Button>
                      )}
                      {step.status === 'completed' && (
                        <Button size="sm" variant="outline" onClick={() => updateStepStatus(step.id, 'not_started')}>
                          Reset
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </main>

      <AIAssistant pathId={pathId} />
    </div>
  );
}