import type { TextareaHTMLAttributes } from "react";
import { fieldCls } from "./fieldStyles";

export function Textarea({ error, className = "", ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  return <textarea className={`py-2.5 min-h-24 resize-none ${fieldCls(error)} ${className}`} {...rest} />;
}
