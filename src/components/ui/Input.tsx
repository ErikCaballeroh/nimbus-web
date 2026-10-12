import type { InputHTMLAttributes } from "react";
import { fieldCls } from "./fieldStyles";

export function Input({ error, className = "", ...rest }: InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return <input className={`h-10 ${fieldCls(error)} ${className}`} {...rest} />;
}
