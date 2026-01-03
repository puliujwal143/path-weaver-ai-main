import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, ArrowRight, Sparkles, Target, BookOpen, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  { id: 1, title: 'Topic', icon: Sparkles },
  { id: 2, title: 'Skill Level', icon: Target },
  { id: 3, title: 'Goal', icon: Target },
  { id: 4, title: 'Format', icon: BookOpen },
  { id: 5, title: 'Time', icon: Clock },
];

const skillLevels = [
  { value: 'beginner', label: 'Beginner', description: 'Just starting out' },
  { value: 'intermediate', label: 'Intermediate', description: 'Know the basics' },
  { value: 'advanced', label: 'Advanced', description: 'Looking to master' },
];

const learningGoals = [
  { value: 'job', label: 'Job Preparation', description: 'Career advancement' },
  { value: 'exam', label: 'Exam Prep', description: 'Certification or test' },
  { value: 'skill_upgrade', label: 'Skill Upgrade', description: 'Improve existing skills' },
  { value: 'personal_interest', label: 'Personal Interest', description: 'Learning for fun' },
];

const learningFormats = [
  { value: 'videos', label: 'Videos', description: 'Video tutorials' },
  { value: 'text', label: 'Text', description: 'Articles & docs' },
  { value: 'projects', label: 'Projects', description: 'Hands-on building' },
  { value: 'mixed', label: 'Mixed', description: 'All formats' },
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    topic: '',
    skillLevel: 'beginner',
    learningGoal: 'personal_interest',
    preferredFormat: 'mixed',
    hoursPerDay: 1,
    daysPerWeek: 5,
  });

  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleNext = () => {
    if (currentStep === 1 && !formData.topic.trim()) {
      toast({
        variant: 'destructive',
        title: 'Topic required',
        description: 'Please enter what you want to learn',
      });
      return;
    }
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);

    // Save learning preferences
    const { data: preference, error: prefError } = await supabase
      .from('learning_preferences')
      .insert({
        user_id: user.id,
        topic: formData.topic,
        skill_level: formData.skillLevel,
        learning_goal: formData.learningGoal,
        preferred_format: formData.preferredFormat,
        hours_per_day: formData.hoursPerDay,
        days_per_week: formData.daysPerWeek,
      })
      .select()
      .single();

    if (prefError) {
      toast({
        variant: 'destructive',
        title: 'Error saving preferences',
        description: prefError.message,
      });
      setLoading(false);
      return;
    }

    // Navigate to generate the learning path
    navigate('/generate', { state: { preferenceId: preference.id, formData } });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      </div>

      {/* Progress indicator */}
      <div className="relative mx-auto mb-8 flex w-full max-w-md items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                currentStep >= step.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-muted-foreground'
              )}
            >
              <step.icon className="h-5 w-5" />
            </div>
            <span className="mt-1 text-xs text-muted-foreground">{step.title}</span>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'absolute top-5 h-0.5 w-[calc(100%/4-2rem)]',
                  currentStep > step.id ? 'bg-primary' : 'bg-border'
                )}
                style={{ left: `calc(${index * 25}% + 2.5rem)` }}
              />
            )}
          </div>
        ))}
      </div>

      <Card className="relative mx-auto w-full max-w-lg animate-scale-in border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">
            {currentStep === 1 && 'What do you want to learn?'}
            {currentStep === 2 && 'What\'s your current skill level?'}
            {currentStep === 3 && 'What\'s your learning goal?'}
            {currentStep === 4 && 'How do you prefer to learn?'}
            {currentStep === 5 && 'How much time can you dedicate?'}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && 'Enter any topic, skill, or subject'}
            {currentStep === 2 && 'This helps us tailor the difficulty'}
            {currentStep === 3 && 'We\'ll optimize your path accordingly'}
            {currentStep === 4 && 'Choose your preferred learning format'}
            {currentStep === 5 && 'We\'ll pace your learning journey'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Topic */}
          {currentStep === 1 && (
            <div className="space-y-2">
              <Label htmlFor="topic">Learning Topic</Label>
              <Input
                id="topic"
                placeholder="e.g., Machine Learning, Spanish, Guitar, Web Development..."
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="text-lg"
                autoFocus
              />
            </div>
          )}

          {/* Step 2: Skill Level */}
          {currentStep === 2 && (
            <RadioGroup
              value={formData.skillLevel}
              onValueChange={(value) => setFormData({ ...formData, skillLevel: value })}
              className="space-y-3"
            >
              {skillLevels.map((level) => (
                <Label
                  key={level.value}
                  htmlFor={level.value}
                  className={cn(
                    'flex cursor-pointer items-center space-x-3 rounded-lg border p-4 transition-all hover:bg-secondary/50',
                    formData.skillLevel === level.value && 'border-primary bg-secondary'
                  )}
                >
                  <RadioGroupItem value={level.value} id={level.value} />
                  <div>
                    <div className="font-medium">{level.label}</div>
                    <div className="text-sm text-muted-foreground">{level.description}</div>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          )}

          {/* Step 3: Learning Goal */}
          {currentStep === 3 && (
            <RadioGroup
              value={formData.learningGoal}
              onValueChange={(value) => setFormData({ ...formData, learningGoal: value })}
              className="space-y-3"
            >
              {learningGoals.map((goal) => (
                <Label
                  key={goal.value}
                  htmlFor={goal.value}
                  className={cn(
                    'flex cursor-pointer items-center space-x-3 rounded-lg border p-4 transition-all hover:bg-secondary/50',
                    formData.learningGoal === goal.value && 'border-primary bg-secondary'
                  )}
                >
                  <RadioGroupItem value={goal.value} id={goal.value} />
                  <div>
                    <div className="font-medium">{goal.label}</div>
                    <div className="text-sm text-muted-foreground">{goal.description}</div>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          )}

          {/* Step 4: Learning Format */}
          {currentStep === 4 && (
            <RadioGroup
              value={formData.preferredFormat}
              onValueChange={(value) => setFormData({ ...formData, preferredFormat: value })}
              className="grid grid-cols-2 gap-3"
            >
              {learningFormats.map((format) => (
                <Label
                  key={format.value}
                  htmlFor={format.value}
                  className={cn(
                    'flex cursor-pointer flex-col items-center space-y-2 rounded-lg border p-4 text-center transition-all hover:bg-secondary/50',
                    formData.preferredFormat === format.value && 'border-primary bg-secondary'
                  )}
                >
                  <RadioGroupItem value={format.value} id={format.value} className="sr-only" />
                  <div className="font-medium">{format.label}</div>
                  <div className="text-xs text-muted-foreground">{format.description}</div>
                </Label>
              ))}
            </RadioGroup>
          )}

          {/* Step 5: Time Commitment */}
          {currentStep === 5 && (
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Hours per day</Label>
                  <span className="text-lg font-semibold text-primary">{formData.hoursPerDay}h</span>
                </div>
                <Slider
                  value={[formData.hoursPerDay]}
                  onValueChange={([value]) => setFormData({ ...formData, hoursPerDay: value })}
                  min={1}
                  max={8}
                  step={1}
                  className="py-4"
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Days per week</Label>
                  <span className="text-lg font-semibold text-primary">{formData.daysPerWeek} days</span>
                </div>
                <Slider
                  value={[formData.daysPerWeek]}
                  onValueChange={([value]) => setFormData({ ...formData, daysPerWeek: value })}
                  min={1}
                  max={7}
                  step={1}
                  className="py-4"
                />
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            {currentStep < 5 ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Generate Path
                    <Sparkles className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}