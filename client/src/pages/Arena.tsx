import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Swords, Loader2, ThumbsUp, ThumbsDown, Minus, Sparkles, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

export default function Arena() {
  const { isAuthenticated } = useAuth();
  const [selectedModel1, setSelectedModel1] = useState<number | null>(null);
  const [selectedModel2, setSelectedModel2] = useState<number | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [battleId, setBattleId] = useState<number | null>(null);
  const [battleResult, setBattleResult] = useState<any>(null);
  const [aiComparison, setAiComparison] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isComparingAI, setIsComparingAI] = useState(false);

  const { data: models, isLoading: modelsLoading } = trpc.models.list.useQuery({ isActive: 1 });
  const { data: topics, isLoading: topicsLoading } = trpc.topics.list.useQuery();
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

    if (!selectedTopic) {
      toast.error("Please select a topic");
      return;
    }

    try {
      setIsExecuting(true);
      setBattleResult(null);
      setAiComparison(null);

      const battle = await createBattleMutation.mutateAsync({
        model1Id: selectedModel1,
        model2Id: selectedModel2,
        topicId: selectedTopic,
      });

      setBattleId(battle.battleId);

      const result = await executeBattleMutation.mutateAsync({
        battleId: battle.battleId,
      });

      setBattleResult(result);
      await generateComparison(result);
      toast.success("Battle completed!");
    } catch (error) {
      toast.error("Battle failed to execute");
      console.error(error);
    } finally {
      setIsExecuting(false);
    }
  };

  const generateComparison = async (result: any) => {
    try {
      setIsComparingAI(true);
      const input = {
        response1: result.response1,
        response2: result.response2,
        topic: selectedTopic,
      };
      const encoded = encodeURIComponent(JSON.stringify(input));
      const url = `/api/trpc/battles.compareResponses?input=${encoded}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setAiComparison(data.result?.json?.comparison || "Unable to generate comparison");
      }
    } catch (error) {
      console.error("Failed to generate comparison:", error);
      setAiComparison("Unable to generate AI comparison at this time");
    } finally {
      setIsComparingAI(false);
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
      
      setBattleId(null);
      setBattleResult(null);
      setAiComparison(null);
      setSelectedTopic(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit vote");
    }
  };

  const model1 = models?.find(m => m.id === selectedModel1);
  const model2 = models?.find(m => m.id === selectedModel2);
  const topic = topics?.find(t => t.id === selectedTopic);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]">
        <Navigation />
        <div className="container mx-auto py-12 px-4 text-center">
          <h1 className="text-6xl font-black mb-4 tracking-tight">LOGIN REQUIRED</h1>
          <p className="text-lg text-muted-foreground mb-8">Sign in to start battling AI models</p>
          <Button asChild size="lg">
            <a href={getLoginUrl()}>Login Now</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]">
      <Navigation />
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black mb-4 tracking-tight flex items-center justify-center gap-3">
            <Swords className="w-16 h-16" />
            BATTLE ARENA
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select two AI models and a topic, then watch them compete
          </p>
        </div>

        {!battleResult ? (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Select AI Models</CardTitle>
                <CardDescription>Choose two different models to compete</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Model 1</label>
                    <Select value={selectedModel1?.toString() || ""} onValueChange={(val) => setSelectedModel1(Number(val))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select first model..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-48">
                        {modelsLoading ? (
                          <div className="p-2 text-sm">Loading models...</div>
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
                      <div className="text-xs text-muted-foreground">
                        ELO: {model1.eloRating} | Battles: {model1.totalBattles}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Model 2</label>
                    <Select value={selectedModel2?.toString() || ""} onValueChange={(val) => setSelectedModel2(Number(val))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select second model..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-48">
                        {modelsLoading ? (
                          <div className="p-2 text-sm">Loading models...</div>
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
                      <div className="text-xs text-muted-foreground">
                        ELO: {model2.eloRating} | Battles: {model2.totalBattles}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>Select Battle Topic</CardTitle>
                <CardDescription>Choose what the AI models will compete on</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedTopic?.toString() || ""} onValueChange={(val) => setSelectedTopic(Number(val))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a topic..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {topicsLoading ? (
                      <div className="p-2 text-sm">Loading topics...</div>
                    ) : (
                      topics?.map((t) => (
                        <SelectItem key={t.id} value={t.id.toString()}>
                          {t.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {topic && (
                  <div className="bg-muted/50 p-3 rounded-lg border border-dashed">
                    <p className="text-sm font-medium">{topic.title}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">{topic.difficulty}</Badge>
                      <Badge variant="outline" className="text-xs">{topic.category}</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button
              onClick={handleStartBattle}
              disabled={!selectedModel1 || !selectedModel2 || !selectedTopic || isExecuting}
              size="lg"
              className="w-full h-12 text-lg font-bold"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Battle in Progress...
                </>
              ) : (
                <>
                  <Swords className="w-5 h-5 mr-2" />
                  Start Battle
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-2">
                <CardHeader className="bg-gradient-to-r from-cyan-500/10 to-transparent">
                  <CardTitle className="flex items-center justify-between">
                    <span>{model1?.name}</span>
                    <Badge>{model1?.provider}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="bg-muted/30 p-4 rounded-lg min-h-48 max-h-96 overflow-y-auto">
                    <Streamdown>{battleResult?.response1 || "No response"}</Streamdown>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader className="bg-gradient-to-r from-pink-500/10 to-transparent">
                  <CardTitle className="flex items-center justify-between">
                    <span>{model2?.name}</span>
                    <Badge>{model2?.provider}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="bg-muted/30 p-4 rounded-lg min-h-48 max-h-96 overflow-y-auto">
                    <Streamdown>{battleResult?.response2 || "No response"}</Streamdown>
                  </div>
                </CardContent>
              </Card>
            </div>

            {aiComparison && (
              <Card className="border-2 border-primary/50 bg-gradient-to-r from-primary/5 to-transparent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    AI Analysis & Comparison
                  </CardTitle>
                  <CardDescription>
                    Automated analysis to help determine which response is better
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <Streamdown>{aiComparison}</Streamdown>
                  </div>
                </CardContent>
              </Card>
            )}

            {isComparingAI && (
              <Card className="border-2 border-dashed">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    AI is analyzing the responses...
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-2 bg-gradient-to-r from-cyan-500/5 via-transparent to-pink-500/5">
              <CardHeader>
                <CardTitle>Cast Your Vote</CardTitle>
                <CardDescription>Which AI response was better?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 flex-wrap">
                  <Button
                    onClick={() => handleVote(selectedModel1)}
                    variant="outline"
                    size="lg"
                    className="flex-1 gap-2 border-2"
                  >
                    <ThumbsUp className="w-5 h-5" />
                    {model1?.name}
                  </Button>
                  <Button
                    onClick={() => handleVote(null)}
                    variant="outline"
                    size="lg"
                    className="flex-1 gap-2 border-2"
                  >
                    <Minus className="w-5 h-5" />
                    Draw
                  </Button>
                  <Button
                    onClick={() => handleVote(selectedModel2)}
                    variant="outline"
                    size="lg"
                    className="flex-1 gap-2 border-2"
                  >
                    <ThumbsUp className="w-5 h-5" />
                    {model2?.name}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={() => {
                setBattleResult(null);
                setAiComparison(null);
                setBattleId(null);
              }}
              variant="outline"
              size="lg"
              className="w-full gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Start Another Battle
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
