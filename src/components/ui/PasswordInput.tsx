'use client';

import { useState, type InputHTMLAttributes } from "react";
import { Icon } from "./Icon";
import { Input } from "./Input";

export function PasswordInput({ error, ...rest }: InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input type={show ? "text" : "password"} error={error} className="pr-10" {...rest} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      >
        {show ? <Icon.eyeOff width={17} height={17} /> : <Icon.eye width={17} height={17} />}
      </button>
    </div>
  );
}
