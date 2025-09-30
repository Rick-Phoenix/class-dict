import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface ClassDictionary {
  [key: string]: ClassValue;
}

type ClassValue =
  | string
  | ClassValue[]
  | ClassDictionary
  | (() => ClassValue)
  | false
  | null
  | undefined;

function process_value(value: ClassValue): string | string[] | undefined {
  if (!value) {
    return;
  }

  if (typeof value == "function") {
    return process_value(value());
  } else if (typeof value == "string") {
    return value;
  } else if (Array.isArray(value)) {
    let classes: string[] = [];

    for (const item of value) {
      const class_val = process_value(item);

      if (class_val) {
        if (typeof class_val === "string") {
          classes.push(class_val);
        } else {
          classes.push(...class_val);
        }
      }
    }

    return classes;
  } else if (typeof value === "object") {
    return process_class_dict(value);
  }
}

function process_class_dict(dict: ClassDictionary): string[] {
  let classes: string[] = [];
  const pairs = Object.entries(dict);

  for (const [key, val] of pairs) {
    // Skip falsy keys
    if (key === "false") {
      continue;
    }

    const val_classes = process_value(val);

    if (val_classes) {
      if (typeof val_classes === "string") {
        classes.push(val_classes);
      } else {
        classes.push(...val_classes);
      }
    }
  }

  return classes;
}

export function cda(
  dict: ClassDictionary,
  ...flatOpts: ClassValue[]
): string[] {
  const output = process_class_dict(dict);

  if (flatOpts.length) {
    output.push(clsx(flatOpts));
  }

  return output;
}

export function cd(dict: ClassDictionary, ...flatOpts: ClassValue[]): string {
  return twMerge(cda(dict, ...flatOpts));
}

export function cdc(callback: () => ClassDictionary): string {
  return cd(callback());
}
