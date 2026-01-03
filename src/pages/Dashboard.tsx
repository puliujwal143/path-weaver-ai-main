import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Plus, BookOpen, LogOut, Loader2 } from 'lucide-react';
import { AIAssistant } from '@/components/AIAssistant';

interface LearningPath {
  id: string;
  title: string;
  topic: string;
  progress_percentage: number;
  status: string;
  estimated_hours: number | null;
  created_at: string;
}

export default function Dashboard() {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();

  useEffect(() => {
    fetchPaths();
  }, []);

  const fetchPaths = async () => {
  const { data, error } = await supabase
    .from('learning_paths')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch paths:', error);
  } else if (data) {
    setPaths(data);
  }

  setLoading(false);
};

  const activePaths = paths.filter(p => p.status === 'active');
  const completedPaths = paths.filter(p => p.status === 'completed');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Path Weaver</span>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <p className="text-muted-foreground">Continue your learning journey</p>
        </div>

        {/* Quick stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center space-x-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activePaths.length}</p>
                <p className="text-sm text-muted-foreground">Active Paths</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center space-x-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <span className="text-xl">✓</span>
              </div>
              <div>
                <p className="text-2xl font-bold">{completedPaths.length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-center p-6">
              <Link to="/onboarding">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Learning Path
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Learning paths */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : paths.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No learning paths yet</h3>
              <p className="mb-4 text-muted-foreground">Start your first personalized learning journey</p>
              <Link to="/onboarding">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Path
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {activePaths.length > 0 && (
              <div>
                <h2 className="mb-4 text-xl font-semibold">Active Paths</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {activePaths.map((path) => (
                    <Link key={path.id} to={`/path/${path.id}`}>
                      <Card className="transition-all hover:border-primary hover:shadow-md">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg">{path.title}</CardTitle>
                            <Badge variant="secondary">{path.topic}</Badge>
                          </div>
                          <CardDescription>
                            {path.estimated_hours ? `~${path.estimated_hours}h total` : 'In progress'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span className="font-medium">{path.progress_percentage}%</span>
                            </div>
                            <Progress value={path.progress_percentage} />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <AIAssistant />
    </div>
  );
}