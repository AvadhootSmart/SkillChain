"use client";

import * as React from "react";
import { z } from "zod";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DatePicker } from "../datePicker";
import { useWriteContract } from "wagmi";
import { jobsContract } from "@/abi";
import { uploadJSONToPinata } from "@/lib/pinata";
import { parseEther } from "viem";

// --- Zod schema ---
const jobSchema = z.object({
  title: z.string().min(4, "Title must be at least 5 characters"),
  description: z.string().min(4, "Description must be at least 20 characters"),
  budget: z.number().min(1, "Budget must be greater than 0"),
  category: z.string().min(4, "Category must be at least 5 characters"),
  deadline: z.date().optional(),
});

type JobForm = z.infer<typeof jobSchema>;

export function CreateJobDialog({ children }: { children: React.ReactNode }) {
  const [submitting, setSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [txHash, setTxHash] = React.useState<`0x${string}` | undefined>();
  const [form, setForm] = React.useState<JobForm>({
    title: "",
    description: "",
    category: "",
    budget: 0,
  });

  const { writeContractAsync, isPending } = useWriteContract();
  // const { isSuccess, isLoading } = useWaitForTransactionReceipt({
  //   hash: txHash,
  // });

  const handleChange = (
    key: keyof JobForm,
    value: string | number | boolean | Date,
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrors({});

    const parsed = jobSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      //eslint-disable-next-line
      parsed.error.issues.forEach((err: any) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      setSubmitting(false);
      return;
    }

    try {
      // console.log("Submitting job:", parsed.data);
      const cid = await uploadJSONToPinata(parsed.data);

      const hash = await writeContractAsync({
        address: jobsContract.address,
        abi: jobsContract.abi,
        functionName: "CreateJob",
        args: [cid],
        value: parseEther(parsed.data.budget.toString()),
      });
      setTxHash(hash);

      setForm({
        title: "",
        description: "",
        category: "",
        budget: 0,
        deadline: undefined,
      });
    } catch (err) {
      console.error("Error creating job:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a new job</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a freelance job.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="e.g. Build a landing page in Next.js"
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>
          <div>
            <Label htmlFor="Category">Category</Label>
            <Input
              id="Category"
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
              placeholder="eg. Web Development"
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={5}
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe the scope, requirements, and expectations..."
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="budget">Budget</Label>
              <Input
                id="budget"
                type="number"
                value={form.budget}
                onChange={(e) => handleChange("budget", Number(e.target.value))}
              />
              {errors.budget && (
                <p className="text-sm text-red-500">{errors.budget}</p>
              )}
            </div>
            <div>
              <Label htmlFor="deadline">Deadline</Label>
              <DatePicker
                onChange={(date) => handleChange("deadline", date as Date)}
                value={form.deadline ? new Date(form.deadline) : null}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
