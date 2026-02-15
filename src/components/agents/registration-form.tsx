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
import { useTranslations } from "next-intl";
import { useTagLabel } from "@/lib/i18n/tag-utils";

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
  const t = useTranslations("RegistrationForm");
  const getTagLabel = useTagLabel();

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

    const metadata = {
      name,
      description,
      services: [
        {
          type: serviceType,
          name: name.toLowerCase().replace(/\s+/g, "_"),
          description,
          endpoint: "",
          version: "1.0.0",
        },
      ],
      tags: selectedTags,
      supportedTrust: ["onchain-reputation"],
    };

    const json = JSON.stringify(metadata);
    const base64 = btoa(unescape(encodeURIComponent(json)));
    const metadataUri = `data:application/json;base64,${base64}`;
    register(metadataUri);
  };

  if (!isConnected) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="text-4xl mb-4">🔗</div>
          <h3 className="text-lg font-medium">{t("walletNotConnected")}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {t("connectToRegister")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">{t("agentName")}</Label>
            <Input
              id="name"
              placeholder={t("namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("description")}</Label>
            <Textarea
              id="description"
              placeholder={t("descriptionPlaceholder")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>{t("serviceType")}</Label>
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
            <Label>{t("tags")}</Label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {getTagLabel(tag)}
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
              ? t("confirmInWallet")
              : isConfirming
                ? t("registering")
                : t("registerButton")}
          </Button>

          <TxStatus
            hash={hash}
            isPending={isPending}
            isConfirming={isConfirming}
            isSuccess={isSuccess}
            error={error}
            successMessage={t("successMessage")}
          />
        </form>
      </CardContent>
    </Card>
  );
}
