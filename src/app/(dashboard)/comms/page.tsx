"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, MessageCircle, Send } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Tile, TileHeader } from "@/components/ui/tile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TileSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useCommsMessages, useSendCommsMessage } from "@/hooks/use-comms";
import { formatRelativeTime } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

const schema = z.object({
  channel: z.enum(["EMAIL", "IN_APP"]),
  toEmail: z.string().email("Enter a valid email"),
  subject: z.string().optional(),
  body: z.string().min(1, "Message can't be empty"),
});
type FormValues = z.infer<typeof schema>;

export default function CommsHubPage() {
  const { data: messages, isLoading } = useCommsMessages();
  const send = useSendCommsMessage();
  const { push } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { channel: "EMAIL" } });

  const onSubmit = async (values: FormValues) => {
    try {
      await send.mutateAsync(values);
      push("Message sent.");
      reset({ channel: values.channel, toEmail: "", subject: "", body: "" });
    } catch {
      push("Couldn't send the message.", "error");
    }
  };

  return (
    <div>
      <PageHeader
        title="Comms Hub"
        description="Email and in-app messaging. WhatsApp/SMS integration has been removed from this build."
      />

      <div className="grid grid-cols-1 gap-widget-gap xl:grid-cols-3">
        <Tile className="xl:col-span-2">
          <TileHeader title="Recent messages" />
          {isLoading ? (
            <TileSkeleton rows={4} />
          ) : !messages || messages.length === 0 ? (
            <EmptyState icon={Mail} title="No messages yet" />
          ) : (
            <ul className="divide-y divide-outline-variant/60">
              {messages.map((m) => (
                <li key={m.id} className="flex items-start gap-3 py-3.5">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                    {m.channel === "EMAIL" ? <Mail className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-body-base font-medium text-on-surface">
                        {m.fromName} &rarr; {m.toName}
                      </p>
                      {!m.read && <Badge tone="secondary">New</Badge>}
                    </div>
                    {m.subject && <p className="text-body-sm text-on-surface">{m.subject}</p>}
                    <p className="truncate text-body-sm text-on-surface-variant">{m.body}</p>
                  </div>
                  <span className="shrink-0 text-label-md text-on-surface-variant">{formatRelativeTime(m.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Tile>

        <Tile>
          <TileHeader title="New message" />
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <Label htmlFor="channel">Channel</Label>
              <Select id="channel" {...register("channel")}>
                <option value="EMAIL">Email</option>
                <option value="IN_APP">In-app</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="toEmail">Recipient email</Label>
              <Input id="toEmail" type="email" {...register("toEmail")} />
              <FieldError>{errors.toEmail?.message}</FieldError>
            </div>
            <div>
              <Label htmlFor="subject">Subject (optional)</Label>
              <Input id="subject" {...register("subject")} />
            </div>
            <div>
              <Label htmlFor="body">Message</Label>
              <textarea
                id="body"
                rows={4}
                className="w-full rounded border border-outline-variant bg-surface-container-lowest p-3 text-body-base text-on-surface placeholder:text-on-surface-variant focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                {...register("body")}
              />
              <FieldError>{errors.body?.message}</FieldError>
            </div>
            <Button type="submit" size="lg" className="w-full text-black" loading={isSubmitting}>
              <Send className="mr-1.5 h-4 w-4" /> Send
            </Button>
          </form>
        </Tile>
      </div>
    </div>
  );
}
