import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Loader2, ExternalLink, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function AISearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSource, setSearchSource] = useState<"google" | "appstore" | "playstore" | "all">("all");
  const [manualAdd, setManualAdd] = useState(false);
  const [newModel, setNewModel] = useState({
    name: "",
    provider: "",
    modelId: "",
    description: "",
    category: "chat",
  });

  const [, setLocation] = useLocation();
  const addModelMutation = trpc.aiSearch.addDiscoveredModel.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("AI Model added successfully!");
        setManualAdd(false);
        setNewModel({ name: "", provider: "", modelId: "", description: "", category: "chat" });
      } else {
        toast.error(data.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    // In a real implementation, this would call external APIs
    const searchUrls = {
      google: `https://www.google.com/search?q=${encodeURIComponent(searchQuery + " AI model")}`,
      appstore: `https://apps.apple.com/us/search?term=${encodeURIComponent(searchQuery + " AI")}`,
      playstore: `https://play.google.com/store/search?q=${encodeURIComponent(searchQuery + " AI")}&c=apps`,
    };

    if (searchSource === "all") {
      // Open all search sources in new tabs
      Object.values(searchUrls).forEach(url => window.open(url, "_blank"));
      toast.info("Opened search results in new tabs. Find an AI and add it manually below!");
    } else {
      window.open(searchUrls[searchSource], "_blank");
      toast.info(`Opened ${searchSource} search. Find an AI and add it manually below!`);
    }
  };

  const handleAddModel = () => {
    if (!newModel.name || !newModel.provider || !newModel.modelId) {
      toast.error("Please fill in all required fields");
      return;
    }

    addModelMutation.mutate({
      ...newModel,
      source: searchSource === "all" ? "manual" : searchSource,
    });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]">
      <div className="container mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black mb-4 tracking-tight">
            DISCOVER AI MODELS
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Search Google, App Store, and Play Store to find new AI models and add them to the battle arena
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-8 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search External Sources
            </CardTitle>
            <CardDescription>
              Search for AI models across the web and mobile app stores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search for AI models (e.g., 'ChatGPT', 'Claude', 'Gemini')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Search
              </Button>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Badge
                variant={searchSource === "all" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSearchSource("all")}
              >
                All Sources
              </Badge>
              <Badge
                variant={searchSource === "google" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSearchSource("google")}
              >
                Google
              </Badge>
              <Badge
                variant={searchSource === "appstore" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSearchSource("appstore")}
              >
                App Store
              </Badge>
              <Badge
                variant={searchSource === "playstore" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSearchSource("playstore")}
              >
                Play Store
              </Badge>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground">
                <strong>How it works:</strong> Click "Search" to open external search results in new tabs. 
                When you find an AI model you want to add, come back here and use the "Add Model Manually" section below.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Manual Add Section */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Model Manually
            </CardTitle>
            <CardDescription>
              Found an AI model? Add it to the battle arena here
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!manualAdd ? (
              <Button onClick={() => setManualAdd(true)} variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add New AI Model
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Model Name *</label>
                    <Input
                      placeholder="e.g., ChatGPT"
                      value={newModel.name}
                      onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Provider *</label>
                    <Input
                      placeholder="e.g., OpenAI"
                      value={newModel.provider}
                      onChange={(e) => setNewModel({ ...newModel, provider: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Model ID *</label>
                    <Input
                      placeholder="e.g., gpt-4"
                      value={newModel.modelId}
                      onChange={(e) => setNewModel({ ...newModel, modelId: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      value={newModel.category}
                      onChange={(e) => setNewModel({ ...newModel, category: e.target.value })}
                    >
                      <option value="chat">Chat</option>
                      <option value="coding">Coding</option>
                      <option value="image">Image</option>
                      <option value="voice">Voice</option>
                      <option value="writing">Writing</option>
                      <option value="mobile">Mobile</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    placeholder="Brief description of the AI model"
                    value={newModel.description}
                    onChange={(e) => setNewModel({ ...newModel, description: e.target.value })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleAddModel}
                    disabled={addModelMutation.isPending}
                    className="flex-1"
                  >
                    {addModelMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Add to Arena
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setManualAdd(false);
                      setNewModel({ name: "", provider: "", modelId: "", description: "", category: "chat" });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <Button variant="outline" onClick={() => setLocation("/models")}>
            View All Models
          </Button>
          <Button onClick={() => setLocation("/arena")}>
            Start Battle
          </Button>
        </div>
      </div>
    </div>
  );
}
