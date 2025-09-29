// components/TransitionLink.tsx
"use client";
import { cn } from "@/lib/utils";
import { useTransitionStore } from "../store/transition.store";
import { useRouter } from "next/navigation";

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export default function TransitionLink({ href, children, className }: Props) {
  const router = useRouter();
  const { startTransition, endTransition, duration } = useTransitionStore();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    startTransition();

    setTimeout(() => {
      router.push(href);
      endTransition(); // reset for the next page
    }, duration - 100); // match exit animation duration
  };

  return (
    <a href={href} onClick={handleClick} className={cn("", className)}>
      {children}
    </a>
  );
}
