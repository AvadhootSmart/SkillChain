"use client";

import { Button } from "@/components/ui/button";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTrigger,
} from "@/components/ui/stepper";

interface FormStepperProps {
  steps: number[];
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}
export default function FormStepper({
  steps,
  currentStep,
  setCurrentStep,
}: FormStepperProps) {
  return (
    <div className="mx-auto max-w-xl space-y-8 text-center">
      <Stepper value={currentStep} onValueChange={setCurrentStep}>
        {steps.map((step) => (
          <StepperItem
            key={step}
            step={step}
            onClick={() => setCurrentStep(step)}
            className="not-last:flex-1"
          >
            <StepperTrigger asChild>
              <StepperIndicator />
            </StepperTrigger>
            {step < steps.length && <StepperSeparator />}
          </StepperItem>
        ))}
      </Stepper>
      {/* <div className="flex justify-center space-x-4"> */}
      {/*   <Button */}
      {/*     variant="outline" */}
      {/*     className="w-32" */}
      {/*     onClick={() => setCurrentStep((prev) => prev - 1)} */}
      {/*     disabled={currentStep === 1} */}
      {/*   > */}
      {/*     Prev step */}
      {/*   </Button> */}
      {/*   <Button */}
      {/*     variant="outline" */}
      {/*     className="w-32" */}
      {/*     onClick={() => setCurrentStep((prev) => prev + 1)} */}
      {/*     disabled={currentStep > steps.length} */}
      {/*   > */}
      {/*     Next step */}
      {/*   </Button> */}
      {/* </div> */}
    </div>
  );
}
