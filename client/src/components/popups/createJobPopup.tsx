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
import { useWaitForTransactionReceipt } from "wagmi";
import { jobsContract } from "@/abi";
import { uploadJSONToPinata } from "@/lib/pinata";
import { parseEther } from "viem";
import { simulateContract, writeContract } from "@wagmi/core";
import { config } from "@/providers/provider";
import { Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

// --- Zod schema ---
const deliverableRequirementSchema = z.object({
  label: z.string().min(1, "Label is required"),
  description: z.string().optional(),
});

const jobSchema = z.object({
  title: z.string().min(4, "Title must be at least 5 characters"),
  description: z.string().min(4, "Description must be at least 20 characters"),
  deliverables: z.string().min(4, "Deliverables description is required"),
  budget: z.number().min(0.0001, "Budget must be greater than 0"),
  category: z.string().min(4, "Category must be at least 5 characters"),
  deadline: z.date().optional(),
  skills: z.string().min(2, "At least one skill is required"),
  requirements: z.array(deliverableRequirementSchema).min(1, "At least one requirement is required"),
});

type JobForm = z.infer<typeof jobSchema>;

export function CreateJobDialog({ children }: { children: React.ReactNode }) {
  const [step, setStep] = React.useState(1);
  const [submitting, setSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [txHash, setTxHash] = React.useState<`0x${string}` | undefined>();
  const [form, setForm] = React.useState<JobForm>({
    title: "",
    description: "",
    deliverables: "",
    category: "",
    budget: 0,
    skills: "",
    requirements: [{ label: "Main Link", description: "The primary deliverable URL" }],
  });

  const { isSuccess, isLoading: isTxLoading } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const handleChange = (
    key: keyof JobForm,
    value: any,
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addRequirement = () => {
    setForm(prev => ({
      ...prev,
      requirements: [...prev.requirements, { label: "", description: "" }]
    }));
  };

  const removeRequirement = (index: number) => {
    setForm(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const updateRequirement = (index: number, field: keyof z.infer<typeof deliverableRequirementSchema>, value: string) => {
    setForm(prev => {
      const newRequirements = [...prev.requirements];
      newRequirements[index] = { ...newRequirements[index], [field]: value };
      return { ...prev, requirements: newRequirements };
    });
  };

  const nextStep = () => {
    // Validate current step fields
    const step1Fields = ["title", "description", "deliverables", "category", "budget", "skills"];
    const partialForm = {
      title: form.title,
      description: form.description,
      deliverables: form.deliverables,
      category: form.category,
      budget: form.budget,
      skills: form.skills,
      requirements: [{ label: "dummy", description: "" }] // Bypass req validation for step 1
    };

    const parsed = jobSchema.safeParse(partialForm);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((err) => {
        if (err.path[0] && step1Fields.includes(err.path[0] as string)) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
        return;
      }
    }
    setErrors({});
    setStep(2);
  };

  const prevStep = () => setStep(1);

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrors({});

    const parsed = jobSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((err) => {
        if (err.path[0]) {
          const path = err.path.join(".");
          fieldErrors[path] = err.message;
        }
      });
      setErrors(fieldErrors);
      setSubmitting(false);
      return;
    }

    try {
      const jobData = {
        ...parsed.data,
        skills: parsed.data.skills.split(",").map(s => s.trim()).filter(s => s !== ""),
      };

      const jobCid = await uploadJSONToPinata(jobData);

      const { request } = await simulateContract(config, {
        address: jobsContract.address,
        abi: jobsContract.abi,
        functionName: "CreateJob",
        args: [jobCid],
        value: parseEther(parsed.data.budget.toString()),
      });

      const hash = await writeContract(config, request);
      setTxHash(hash);

      setForm({
        title: "",
        description: "",
        deliverables: "",
        category: "",
        budget: 0,
        deadline: undefined,
        skills: "",
        requirements: [{ label: "Main Link", description: "" }],
      });
      setStep(1);
    } catch (err) {
      console.error("Error creating job:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog onOpenChange={(open) => !open && setStep(1)}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center pr-6">
            <DialogTitle className="text-2xl font-semibold">
              {step === 1 ? "Job Details" : "Deliverable Requirements"}
            </DialogTitle>
            <span className="text-sm font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
              Step {step} of 2
            </span>
          </div>
          <DialogDescription>
            {step === 1 
              ? "Tell us what you need help with." 
              : "Define what the freelancer needs to submit (e.g., Video Links, GitHub Repo)."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="e.g. Need a video editor for short videos"
                />
                {errors.title && (
                  <p className="text-xs text-red-500">{errors.title}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="Category">Category</Label>
                <Input
                  id="Category"
                  value={form.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  placeholder="eg. Video Editing"
                />
                {errors.category && (
                  <p className="text-xs text-red-500">{errors.category}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Describe the scope, requirements, and expectations..."
                />
                {errors.description && (
                  <p className="text-xs text-red-500">{errors.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliverables">Deliverables</Label>
                <Textarea
                  id="deliverables"
                  rows={3}
                  value={form.deliverables}
                  onChange={(e) => handleChange("deliverables", e.target.value)}
                  placeholder="List the expected deliverables (for information)"
                />
                {errors.deliverables && (
                  <p className="text-xs text-red-500">{errors.deliverables}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <Input
                  id="skills"
                  value={form.skills}
                  onChange={(e) => handleChange("skills", e.target.value)}
                  placeholder="e.g. Premiere Pro, After Effects, Storyboarding"
                />
                <p className="text-xs text-muted-foreground">
                  Comma separated
                </p>
                {errors.skills && (
                  <p className="text-xs text-red-500">{errors.skills}</p>
                )}
              </div>

              <div className="flex gap-2">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="budget">Budget (ETH)</Label>
                  <Input
                    id="budget"
                    type="number"
                    step="0.0001"
                    value={form.budget}
                    onChange={(e) => handleChange("budget", Number(e.target.value))}
                  />
                  {errors.budget && (
                    <p className="text-xs text-red-500">{errors.budget}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <DatePicker
                    onChange={(date) => handleChange("deadline", date as Date)}
                    value={form.deadline ? new Date(form.deadline) : null}
                  />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-4">
                {form.requirements.map((del, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-muted/30 space-y-3 relative group">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Requirement {index + 1}</h4>
                      {form.requirements.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removeRequirement(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Field Label</Label>
                      <Input
                        placeholder="e.g. Final Video Link"
                        value={del.label}
                        onChange={(e) => updateRequirement(index, "label", e.target.value)}
                        className="bg-background"
                      />
                      {errors[`requirements.${index}.label`] && (
                        <p className="text-xs text-red-500">{errors[`requirements.${index}.label`]}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Description (Optional)</Label>
                      <Input
                        placeholder="e.g. Google Drive or Loom link"
                        value={del.description}
                        onChange={(e) => updateRequirement(index, "description", e.target.value)}
                        className="bg-background"
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <Button 
                variant="outline" 
                className="w-full border-dashed" 
                onClick={addRequirement}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Requirement
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between border-t pt-4">
          <div className="flex gap-2">
            {step === 2 ? (
              <Button variant="outline" onClick={prevStep}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            ) : (
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
            )}
          </div>
          
          <div className="flex gap-2">
            {step === 1 ? (
              <Button onClick={nextStep}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitting || isTxLoading || isSuccess}
                className="bg-primary text-primary-foreground"
              >
                {isTxLoading ? "Confirming..." : submitting ? "Creating..." : "Create Job"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
