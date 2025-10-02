"use client";

import * as React from "react";
// OTP input removed from auth flows; keep a minimal placeholder to avoid breaking imports
// If needed in the future, reintroduce the dependency and components.
import { MinusIcon } from "lucide-react";

import { cn } from "./utils";

function InputOTP({ className, containerClassName, ...props }: React.ComponentProps<"div"> & { containerClassName?: string }) {
  return (
    <div
      data-slot="input-otp"
      className={cn(
        "flex items-center gap-2 has-disabled:opacity-50",
        containerClassName,
        className
      )}
      {...props}
    />
  );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  );
}

function InputOTPSlot({ index: _index, className, ...props }: React.ComponentProps<"div"> & { index: number }) {
  return (
    <div
      data-slot="input-otp-slot"
      className={cn(
        "border-input relative flex h-9 w-9 items-center justify-center border-y border-r text-sm bg-input-background first:rounded-l-md first:border-l last:rounded-r-md",
        className,
      )}
      {...props}
    />
  );
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <MinusIcon />
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
