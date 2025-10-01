"use client";

import { useId, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  disabled?: boolean;
  value: Date | null;
  onChange: (date: Date | null) => void;
}
export function DatePicker({
  onChange,
  value: date,
  disabled,
}: DatePickerProps) {
  const id = useId();

  return (
    <div className="w-full">
      <div className="*:not-first:mt-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id={id}
              variant={"outline"}
              className="group bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]"
              disabled={disabled}
            >
              <span
                className={cn("truncate", !date && "text-muted-foreground")}
              >
                {date ? format(date, "PPP") : "Pick Deadline date"}
              </span>
              <CalendarIcon
                size={16}
                className="text-muted-foreground/80 group-hover:text-foreground shrink-0 transition-colors"
                aria-hidden="true"
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <Calendar
              mode="single"
              selected={date || undefined}
              onSelect={(selectedDate) =>
                selectedDate ? onChange(selectedDate) : onChange(null)
              }
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
