"use client";

import React, { useState } from "react";

type FieldErrors = Partial<Record<"name" | "email" | "subject" | "message", string>>;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateClient(
  name: string,
  email: string,
  message: string
): FieldErrors {
  const errors: FieldErrors = {};
  if (!name.trim()) errors.name = "Please enter your name.";
  if (!email.trim()) errors.email = "Please enter your email.";
  else if (!emailRegex.test(email.trim()))
    errors.email = "Please enter a valid email address.";
  if (!message.trim()) errors.message = "Please enter a message.";
  return errors;
}

export default function Mail() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("idle");
    setFeedback(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = (formData.get("name") as string) ?? "";
    const email = (formData.get("email") as string) ?? "";
    const subject = (formData.get("subject") as string) ?? "";
    const message = (formData.get("message") as string) ?? "";

    const errors = validateClient(name, email, message);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim() || undefined,
          message: message.trim(),
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        setStatus("error");
        setFeedback(
          data.error ?? "Something went wrong. Please try again in a moment."
        );
        return;
      }

      setStatus("success");
      setFeedback(
        data.message ?? "Thanks — your message was sent successfully."
      );
      form.reset();
      setFieldErrors({});
    } catch {
      setStatus("error");
      setFeedback(
        "Could not reach the server. Check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur-sm sm:p-8 lg:px-8">
      <div className="mb-8 text-center sm:text-left">
        <h2
          className="mb-2 text-3xl font-bold tracking-tight text-white sm:text-4xl"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Contact
        </h2>
        <p className="text-base text-white/60">
          Send a message and I&apos;ll get back to you by email.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-medium text-white/90"
          >
            Name <span className="text-indigo-400">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            autoComplete="name"
            disabled={loading}
            aria-invalid={!!fieldErrors.name}
            aria-describedby={fieldErrors.name ? "name-error" : undefined}
            className="w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-white placeholder:text-white/35 outline-none ring-indigo-400/0 transition focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/30 disabled:opacity-60"
            placeholder="Your name"
          />
          {fieldErrors.name && (
            <p id="name-error" className="mt-1.5 text-sm text-rose-400" role="alert">
              {fieldErrors.name}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-white/90"
          >
            Email <span className="text-indigo-400">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            disabled={loading}
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            className="w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-white placeholder:text-white/35 outline-none ring-indigo-400/0 transition focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/30 disabled:opacity-60"
            placeholder="you@example.com"
          />
          {fieldErrors.email && (
            <p id="email-error" className="mt-1.5 text-sm text-rose-400" role="alert">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="subject"
            className="mb-1.5 block text-sm font-medium text-white/90"
          >
            Subject <span className="text-white/40">(optional)</span>
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            disabled={loading}
            maxLength={200}
            className="w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-white placeholder:text-white/35 outline-none ring-indigo-400/0 transition focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/30 disabled:opacity-60"
            placeholder="What is this about?"
          />
        </div>

        <div>
          <label
            htmlFor="message"
            className="mb-1.5 block text-sm font-medium text-white/90"
          >
            Message <span className="text-indigo-400">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            disabled={loading}
            aria-invalid={!!fieldErrors.message}
            aria-describedby={
              fieldErrors.message ? "message-error" : "message-hint"
            }
            className="min-h-[140px] w-full resize-y rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-white placeholder:text-white/35 outline-none ring-indigo-400/0 transition focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/30 disabled:opacity-60"
            placeholder="Write your message here…"
          />
          <p id="message-hint" className="mt-1.5 text-xs text-white/40">
            Tip: include any context that helps me reply quickly.
          </p>
          {fieldErrors.message && (
            <p id="message-error" className="mt-1.5 text-sm text-rose-400" role="alert">
              {fieldErrors.message}
            </p>
          )}
        </div>

        {status === "success" && feedback && (
          <div
            className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
            role="status"
            aria-live="polite"
          >
            {feedback}
          </div>
        )}

        {status === "error" && feedback && (
          <div
            className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
            role="alert"
            aria-live="assertive"
          >
            {feedback}
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-lg bg-indigo-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[180px]"
          >
            {loading ? (
              <>
                <svg
                  className="-ml-1 mr-2 h-5 w-5 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Sending…
              </>
            ) : (
              "Send message"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
