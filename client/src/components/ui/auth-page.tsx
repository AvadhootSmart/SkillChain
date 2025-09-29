"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "./button";
import {
  AppleIcon,
  AtSignIcon,
  ChevronLeftIcon,
  GithubIcon,
  Grid2x2PlusIcon,
} from "lucide-react";
import { Input } from "./input";
import TransitionLink from "../transitionLink";

export function AuthPage() {
  // Variants for staggering
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" as const },
    },
    exit: {
      opacity: 0,
      y: 20,
      transition: { duration: 0.3, ease: "easeIn" as const },
    },
  };

  return (
    <main className="relative flex min-h-screen flex-col justify-center p-4">
      <Button variant="ghost" className="absolute top-7 left-5" asChild>
        <TransitionLink href="/">
          <ChevronLeftIcon className="size-4 me-2" />
          Go Back
        </TransitionLink>
      </Button>

      <motion.div
        className="mx-auto space-y-4 sm:w-sm"
        variants={container}
        initial="hidden"
        animate="show"
        exit="exit"
      >
        <motion.div className="flex items-center gap-2" variants={item}>
          <Grid2x2PlusIcon className="size-6" />
          <p className="text-xl font-semibold">Acme</p>
        </motion.div>

        <motion.div className="flex flex-col space-y-1" variants={item}>
          <h1 className="font-heading text-2xl font-bold tracking-wide">
            Sign In or Join Now!
          </h1>
          <p className="text-muted-foreground text-base">
            login or create your asme account.
          </p>
        </motion.div>

        <motion.div className="space-y-2" variants={item}>
          <Button type="button" size="lg" className="w-full">
            <GoogleIcon className="size-4 me-2" />
            Continue with Google
          </Button>
          <Button type="button" size="lg" className="w-full">
            <AppleIcon className="size-4 me-2" />
            Continue with Apple
          </Button>
          <Button type="button" size="lg" className="w-full">
            <GithubIcon className="size-4 me-2" />
            Continue with GitHub
          </Button>
        </motion.div>

        <motion.div variants={item}>
          <AuthSeparator />
        </motion.div>

        <motion.form className="space-y-2" variants={item}>
          <p className="text-muted-foreground text-start text-xs">
            Enter your email address to sign in or create an account
          </p>
          <div className="relative h-max">
            <Input
              placeholder="your.email@example.com"
              className="peer ps-9"
              type="email"
            />
            <div className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
              <AtSignIcon className="size-4" aria-hidden="true" />
            </div>
          </div>
          <Button type="button" className="w-full">
            <span>Continue With Email</span>
          </Button>
        </motion.form>

        <motion.p
          className="text-muted-foreground mt-8 text-sm"
          variants={item}
        >
          By clicking continue, you agree to our{" "}
          <a
            href="#"
            className="hover:text-primary underline underline-offset-4"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="#"
            className="hover:text-primary underline underline-offset-4"
          >
            Privacy Policy
          </a>
          .
        </motion.p>
      </motion.div>
    </main>
  );
}

const GoogleIcon = (props: React.ComponentProps<"svg">) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M12.479,14.265v-3.279h11.049c0.108,0.571,0.164,1.247,0.164,1.979c0,2.46-0.672,5.502-2.84,7.669   C18.744,22.829,16.051,24,12.483,24C5.869,24,0.308,18.613,0.308,12S5.869,0,12.483,0c3.659,0,6.265,1.436,8.223,3.307L18.392,5.62   c-1.404-1.317-3.307-2.341-5.913-2.341C7.65,3.279,3.873,7.171,3.873,12s3.777,8.721,8.606,8.721c3.132,0,4.916-1.258,6.059-2.401   c0.927-0.927,1.537-2.251,1.777-4.059L12.479,14.265z" />
  </svg>
);

const AuthSeparator = () => {
  return (
    <div className="flex w-full items-center justify-center">
      <div className="bg-border h-px w-full" />
      <span className="text-muted-foreground px-2 text-xs">OR</span>
      <div className="bg-border h-px w-full" />
    </div>
  );
};
