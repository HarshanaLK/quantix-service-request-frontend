"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, FileText, Save, Send } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { CATEGORIES, CATEGORY_LABELS, PRIORITIES } from "@/lib/config";
import type { RequestInput, ServiceRequest } from "@/lib/types";
import { Alert, FieldError, PageTitle } from "./ui";

const empty: RequestInput = {
  title: "",
  description: "",
  category: "it_support",
  priority: "medium",
};

export function RequestForm({ request }: { request?: ServiceRequest }) {
  const router = useRouter();
  const [form, setForm] = useState<RequestInput>(
    request
      ? {
          title: request.title,
          description: request.description,
          category: request.category,
          priority: request.priority,
        }
      : empty,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitNow, setSubmitNow] = useState(true);
  const isEdit = Boolean(request);
  async function save(e: FormEvent) {
    e.preventDefault();
    setError("");
    setErrors({});
    setBusy(true);
    try {
      const result = request
        ? await api.update(request.id, form)
        : await api.create({ ...form, submit: submitNow });
      router.push(`/requests/${result.data.id}`);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setErrors(err.errors);
      } else setError("Unable to save your request. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  function set<K extends keyof RequestInput>(key: K, value: RequestInput[K]) {
    setForm((old) => ({ ...old, [key]: value }));
  }
  return (
    <>
      <Link
        href={request ? `/requests/${request.id}` : "/requests"}
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to requests
      </Link>
      <PageTitle
        eyebrow={isEdit ? `Request #${request?.id}` : "Get support"}
        title={isEdit ? "Edit service request" : "Create a new request"}
        subtitle={
          isEdit
            ? "Update the details of your draft or returned request."
            : "Describe what you need so the right team can help."
        }
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(250px,.8fr)]">
        <form
          onSubmit={save}
          id="request-form"
          className="panel space-y-6 p-6 sm:p-8"
        >
          <div className="border-b border-slate-100 pb-5">
            <h2 className="section-title flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" /> Request details
            </h2>
            <p className="mt-1.5 text-sm text-muted">
              Fields marked with * are required.
            </p>
          </div>
          {error && <Alert message={error} />}
          <div>
            <label htmlFor="request-title" className="field-label">
              Request title *
            </label>
            <input
              id="request-title"
              autoFocus
              required
              minLength={5}
              maxLength={150}
              className={`field ${errors.title ? "field-error" : ""}`}
              placeholder="e.g. Cannot access company email"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
            <div className="mt-1.5 flex justify-between text-xs text-slate-400">
              <FieldError message={errors.title?.[0]} />
              <span className="ml-auto">{form.title.length}/150</span>
            </div>
          </div>
          <div>
            <label htmlFor="request-description" className="field-label">
              Description *
            </label>
            <textarea
              id="request-description"
              required
              minLength={10}
              maxLength={5000}
              rows={7}
              className={`field resize-y ${errors.description ? "field-error" : ""}`}
              placeholder="Describe the issue, when it started, and what help you need..."
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
            <div className="mt-1.5 flex justify-between text-xs text-slate-400">
              <FieldError message={errors.description?.[0]} />
              <span className="ml-auto">{form.description.length}/5000</span>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="request-category" className="field-label">
                Category *
              </label>
              <select
                id="request-category"
                className="field"
                value={form.category}
                onChange={(e) =>
                  set("category", e.target.value as RequestInput["category"])
                }
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {CATEGORY_LABELS[category]}
                  </option>
                ))}
              </select>
              <FieldError message={errors.category?.[0]} />
            </div>
            <div>
              <label htmlFor="request-priority" className="field-label">
                Priority
              </label>
              <select
                id="request-priority"
                className="field capitalize"
                value={form.priority}
                onChange={(e) =>
                  set("priority", e.target.value as RequestInput["priority"])
                }
              >
                {PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </select>
              <FieldError message={errors.priority?.[0]} />
            </div>
          </div>
          {!isEdit && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
              <div className="flex items-start gap-3">
                <input
                  id="submit-now"
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-indigo-600"
                  checked={submitNow}
                  onChange={(e) => setSubmitNow(e.target.checked)}
                />
                <div>
                  <label
                    htmlFor="submit-now"
                    className="cursor-pointer text-sm font-bold text-indigo-900"
                  >
                    Submit for manager review now
                  </label>
                  <p className="mt-1 text-xs leading-5 text-indigo-700">
                    When checked, the request is sent to your reporting manager.
                    Uncheck to save it as a draft instead.
                  </p>
                </div>
              </div>
              <FieldError message={errors.manager?.[0]} />
            </div>
          )}
          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
            <Link
              className="btn-secondary"
              href={request ? `/requests/${request.id}` : "/requests"}
            >
              Cancel
            </Link>
            <button disabled={busy} type="submit" className="btn-primary">
              {busy
                ? "Saving..."
                : isEdit
                  ? "Save changes"
                  : submitNow
                    ? "Create & submit"
                    : "Save as draft"}
              {isEdit ? (
                <Save className="h-4 w-4" />
              ) : submitNow ? (
                <Send className="h-4 w-4" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </button>
          </div>
        </form>
        <aside className="space-y-5">
          <div className="panel p-6">
            <h3 className="font-bold text-ink">What happens next?</h3>
            <div className="mt-5 space-y-5">
              {[
                {
                  title: "1. Create",
                  description: "Add clear details and choose a category.",
                },
                {
                  title: "2. Review",
                  description: "Your assigned manager reviews the submission.",
                },
                {
                  title: "3. Resolve",
                  description:
                    "Operations assigns, works on, and completes approved requests.",
                },
              ].map((row) => (
                <div className="flex gap-3" key={row.title}>
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                  <div>
                    <div className="text-sm font-bold text-slate-700">
                      {row.title}
                    </div>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      {row.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-xs leading-6 text-amber-900">
            You can only edit requests while they are in <strong>Draft</strong>{" "}
            or <strong>Returned</strong> status. A returned request must be
            resubmitted after editing.
          </div>
        </aside>
      </div>
    </>
  );
}
