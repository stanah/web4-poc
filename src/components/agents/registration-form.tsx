"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRegisterAgent } from "@/lib/contracts/hooks/use-identity";
import { TxStatus } from "@/components/web3/tx-status";

const AVAILABLE_TAGS = [
  "oracle",
  "defi",
  "nlp",
  "translation",
  "analytics",
  "research",
  "automation",
  "security",
  "price-feed",
  "multilingual",
];

export function RegistrationForm() {
  const { isConnected } = useAccount();
  const { register, hash, isPending, isConfirming, isSuccess, error } =
    useRegisterAgent();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [serviceType, setServiceType] = useState<"MCP" | "A2A">("A2A");

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) return;

    const metadataUri = `${window.location.origin}/api/agents/new/metadata`;
    register(metadataUri);
  };

  if (!isConnected) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="text-4xl mb-4">🔗</div>
          <h3 className="text-lg font-medium">Wallet Not Connected</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Connect your wallet to register an agent
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register New Agent</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Agent Name</Label>
            <Input
              id="name"
              placeholder="e.g., MyAwesomeBot"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what your agent does..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Service Type</Label>
            <div className="flex gap-2">
              {(["MCP", "A2A"] as const).map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={serviceType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setServiceType(type)}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isPending || isConfirming || !name || !description}
          >
            {isPending
              ? "Confirm in Wallet..."
              : isConfirming
                ? "Registering..."
                : "Register Agent (Mint ERC-721)"}
          </Button>

          <TxStatus
            hash={hash}
            isPending={isPending}
            isConfirming={isConfirming}
            isSuccess={isSuccess}
            error={error}
            successMessage="Agent registered successfully! Your agent NFT has been minted."
          />
        </form>
      </CardContent>
    </Card>
  );
}
