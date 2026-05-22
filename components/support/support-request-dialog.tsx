"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { LifeBuoy, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getFreshBrowserNhostSession } from "@/lib/nhost/client";
import { cn } from "@/lib/utils";

export type SupportRequestLabels = {
  contactSupport: string;
  description: string;
  category: string;
  subject: string;
  message: string;
  sendRequest: string;
  sending: string;
  sent: string;
  error: string;
  validation: string;
  close: string;
  categories: Record<string, string>;
};

type SupportRequestDialogProps = {
  labels: SupportRequestLabels;
  triggerClassName?: string;
};

const categoryOptions = [
  "general",
  "questionnaire",
  "documents",
  "evidence_links",
  "sharing",
  "passport_pdf",
  "account",
  "other",
] as const;

export function SupportRequestDialog({ labels, triggerClassName }: SupportRequestDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<(typeof categoryOptions)[number]>("general");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; text: string } | null>(
    null,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (message.trim().length < 3) {
      setFeedback({ tone: "error", text: labels.validation });
      return;
    }

    setIsSending(true);
    setFeedback(null);

    try {
      const session = await getFreshBrowserNhostSession();
      const response = await fetch("/api/support-requests", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(session?.accessToken ? { authorization: `Bearer ${session.accessToken}` } : {}),
        },
        body: JSON.stringify({ category, subject, message }),
      });

      if (!response.ok) {
        setFeedback({ tone: "error", text: labels.error });
        return;
      }

      setFeedback({ tone: "success", text: labels.sent });
      setSubject("");
      setMessage("");
      setCategory("general");
    } catch {
      setFeedback({ tone: "error", text: labels.error });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className={cn("mt-4 w-full rounded-xl bg-white font-semibold", triggerClassName)}
          />
        }
      >
        <LifeBuoy data-icon="inline-start" />
        {labels.contactSupport}
      </DialogTrigger>
      <DialogContent className="max-w-lg gap-5 p-5 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-950">
            {labels.contactSupport}
          </DialogTitle>
          <DialogDescription className="leading-6">{labels.description}</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            {labels.category}
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as typeof category)}
            >
              <SelectTrigger className="h-11 w-full bg-white">
                <SelectValue>{labels.categories[category]}</SelectValue>
              </SelectTrigger>
              <SelectContent align="start">
                {categoryOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {labels.categories[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            {labels.subject}
            <Input
              value={subject}
              maxLength={160}
              onChange={(event) => setSubject(event.target.value)}
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            {labels.message}
            <Textarea
              value={message}
              rows={5}
              maxLength={3000}
              required
              onChange={(event) => setMessage(event.target.value)}
            />
          </label>
          {feedback ? (
            <p
              className={cn(
                "rounded-xl px-3 py-2 text-sm font-medium",
                feedback.tone === "success"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700",
              )}
            >
              {feedback.text}
            </p>
          ) : null}
          <DialogFooter className="-mx-5 -mb-5 px-5">
            <Button
              type="button"
              variant="outline"
              className="bg-white"
              onClick={() => setIsOpen(false)}
            >
              {labels.close}
            </Button>
            <Button type="submit" disabled={isSending}>
              <Send data-icon="inline-start" />
              {isSending ? labels.sending : labels.sendRequest}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
