import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Swords, Loader2, ThumbsUp, ThumbsDown, Minus, Sparkles, Clock } from "lucide-react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

export default function Arena() {
  const { isAuthenticated } = useAuth();
  const [selectedModel1, setSelectedModel1] = useState<number | null>(null);
  const [selectedModel2, setSelectedModel2] = useState<number | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [battleId, setBattleId] = useState<number | null>(null);
  const [battleResult, setBattleResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const { data: models, isLoading: modelsLoading } = trpc.models.list.useQuery({ isActive: 1 });
  const { data: randomTopic } = trpc.topics.random.useQuery();
  const createBattleMutation = trpc.battles.create.useMutation();
  const executeBattleMutation = trpc.battles.execute.useMutation();
  const submitVoteMutation = trpc.votes.submit.useMutation();

  const handleStartBattle = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to start a battle");
      return;
    }

    if (!selectedModel1 || !selectedModel2) {
      toast.error("Please select two AI models");
      return;
    }

    if (selectedModel1 === selectedModel2) {
      toast.error("Please select different models");
      return;
    }

    if (!customPrompt && !randomTopic) {
      toast.error("Please enter a prompt or wait for topic to load");
      return;
    }

    try {
      setIsExecuting(true);
      setBattleResult(null);

      // Create battle
      const battle = await createBattleMutation.mutateAsync({
        model1Id: selectedModel1,
        model2Id: selectedModel2,
        topicId: randomTopic!.id,
        customPrompt: customPrompt || undefined,
      });

      setBattleId(battle.battleId);

      // Execute battle
      const result = await executeBattleMutation.mutateAsync({
        battleId: battle.battleId,
      });

      setBattleResult(result);
      toast.success("Battle completed!");
    } catch (error) {
      toast.error("Battle failed to execute");
      console.error(error);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleVote = async (votedModelId: number | null) => {
    if (!battleId) return;

    try {
      await submitVoteMutation.mutateAsync({
        battleId,
        votedModelId,
      });
      toast.success("Vote submitted!");
      
      // Reset for next battle
      setBattleId(null);
      setBattleResult(null);
      setCustomPrompt("");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit vote");
    }
  };

  const model1 = models?.find(m => m.id === selectedModel1);
  const model2 = models?.find(m => m.id === selectedModel2);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>Please login to access the battle arena</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <a href={getLoginUrl()}>Login to Continue</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <div className="container py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Swords className="w-8 h-8 text-primary" />
            <h2>Battle Arena</h2>
          </div>
          <p className="text-muted-foreground">
            Select two AI models and watch them compete in real-time
          </p>
        </div>

        {/* Model Selection */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-2 border-primary/30">
            <CardHeader>
              <CardTitle className="text-xl">Model A</CardTitle>
              <CardDescription>Select first AI model</CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedModel1?.toString()}
                onValueChange={(value) => setSelectedModel1(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose AI model..." />
                </SelectTrigger>
                <SelectContent>
                  {modelsLoading ? (
                    <SelectItem value="loading">Loading...</SelectItem>
                  ) : (
                    models?.map((model) => (
                      <SelectItem key={model.id} value={model.id.toString()}>
                        {model.name} ({model.provider})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {model1 && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{model1.provider}</Badge>
                    {model1.category && <Badge variant="secondary">{model1.category}</Badge>}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ELO: <span className="font-bold text-foreground">{model1.eloRating}</span>
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">
                    {model1.totalWins}W / {model1.totalLosses}L / {model1.totalDraws}D
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 border-secondary/30">
            <CardHeader>
              <CardTitle className="text-xl">Model B</CardTitle>
              <CardDescription>Select second AI model</CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedModel2?.toString()}
                onValueChange={(value) => setSelectedModel2(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose AI model..." />
                </SelectTrigger>
                <SelectContent>
                  {modelsLoading ? (
                    <SelectItem value="loading">Loading...</SelectItem>
                  ) : (
                    models?.map((model) => (
                      <SelectItem key={model.id} value={model.id.toString()}>
                        {model.name} ({model.provider})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {model2 && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{model2.provider}</Badge>
                    {model2.category && <Badge variant="secondary">{model2.category}</Badge>}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ELO: <span className="font-bold text-foreground">{model2.eloRating}</span>
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">
                    {model2.totalWins}W / {model2.totalLosses}L / {model2.totalDraws}D
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Prompt Input */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Battle Prompt</CardTitle>
            <CardDescription>
              Enter a custom prompt or use the suggested topic below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {randomTopic && (
              <div className="p-4 bg-accent rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">Suggested Topic</span>
                  <Badge variant="outline">{randomTopic.category}</Badge>
                  <Badge variant="secondary">{randomTopic.difficulty}</Badge>
                </div>
                <p className="text-sm font-medium">{randomTopic.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{randomTopic.prompt}</p>
              </div>
            )}
            <Textarea
              placeholder="Or enter your own prompt here..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <Button
              onClick={handleStartBattle}
              disabled={isExecuting || !selectedModel1 || !selectedModel2}
              className="w-full gap-2"
              size="lg"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Battle in Progress...
                </>
              ) : (
                <>
                  <Swords className="w-5 h-5" />
                  Start Battle
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Battle Results */}
        {battleResult && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Battle Results</h3>
              <p className="text-muted-foreground">Vote for the better response</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-2 border-primary/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{model1?.name}</CardTitle>
                    <Badge variant="outline" className="gap-1">
                      <Clock className="w-3 h-3" />
                      {battleResult.model1ResponseTime}ms
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <Streamdown>{battleResult.model1Response}</Streamdown>
                  </div>
                  <Separator className="my-4" />
                  <Button
                    onClick={() => handleVote(selectedModel1)}
                    variant="default"
                    className="w-full gap-2"
                    disabled={submitVoteMutation.isPending}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Vote for {model1?.name}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-secondary/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{model2?.name}</CardTitle>
                    <Badge variant="outline" className="gap-1">
                      <Clock className="w-3 h-3" />
                      {battleResult.model2ResponseTime}ms
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <Streamdown>{battleResult.model2Response}</Streamdown>
                  </div>
                  <Separator className="my-4" />
                  <Button
                    onClick={() => handleVote(selectedModel2)}
                    variant="default"
                    className="w-full gap-2"
                    disabled={submitVoteMutation.isPending}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Vote for {model2?.name}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button
                onClick={() => handleVote(null)}
                variant="outline"
                className="gap-2"
                disabled={submitVoteMutation.isPending}
              >
                <Minus className="w-4 h-4" />
                It's a Draw
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
