import { twMerge } from "tailwind-merge";

interface ClassDictionary {
  [key: string]: ClassValue;
}

type ClassValue =
  | string
  | boolean
  | ClassValue[]
  | ClassDictionary
  | (() => ClassValue)
  | null
  | undefined;

function process_value(value: ClassValue): string | string[] | undefined {
  if (!value) {
    return;
  }

  if (typeof value === "function") {
    return process_value(value());
  } else if (typeof value === "string") {
    return value;
  } else if (Array.isArray(value)) {
    let classes: string[] = [];

    for (const item of value) {
      const class_val = process_value(item);

      if (typeof class_val === "string") {
        classes.push(class_val);
      } else if (Array.isArray(class_val)) {
        classes.push(...class_val);
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
    // Adding the key to the classes if the value evaluates to `true`
    if (val === true) {
      classes.push(key);
      continue;
    }

    const val_classes = process_value(val);

    if (typeof val_classes === "string") {
      classes.push(val_classes);
    } else if (Array.isArray(val_classes)) {
      classes.push(...val_classes);
    }
  }

  return classes;
}

/**
 * Processes class values and collect them into an array.
 *
 * A `ClassValue` can be an expression that evaluates to:
 * - A string
 * - A boolean
 * - An array of other `ClassValues`
 * - A callback that returns a `ClassValue`
 * - A `ClassDictionary`
 *
 * When handling a `ClassDictionary`, the logic will be:
 * - If the value is `false`, it is skipped
 * - If the value is `true`, the **key** will be added to the list of classnames
 * - Otherwise, the key can be any arbitrary string used for organizing classnames, and the value is evaluated as a `ClassValue`.
 *
 * @param values - Any number of class values to process
 * @returns Array of class name strings
 *
 * @example
 * ```ts
 * cda({ "active": isActive, "disabled": false })
 * // => ["active"] (if isActive is true)
 *
 * cda(
 *   { layout: ["flex", "items-center"] },
 *   isVisible && "visible",
 *   () => isDark ? "dark" : "light"
 * )
 * // => ["flex", "items-center", "visible", "dark"]
 * ```
 */
export function cda(
  ...values: ClassValue[]
): string[] {
  const output: string[] = [];

  for (const val of values) {
    const class_val = process_value(val);

    if (typeof class_val === "string") {
      output.push(class_val);
    } else if (Array.isArray(class_val)) {
      output.push(...class_val);
    }
  }

  return output;
}

/**
 * Processes class values, collects them and calls `twMerge` on the result.
 *
 * A `ClassValue` can be an expression that evaluates to:
 * - A string
 * - A boolean
 * - An array of other `ClassValues`
 * - A callback that returns a `ClassValue`
 * - A `ClassDictionary`
 *
 * When handling a `ClassDictionary`, the logic will be:
 * - If the value is `false`, it is skipped
 * - If the value is `true`, the **key** will be added to the list of classnames
 * - Otherwise, the key can be any arbitrary string used for organizing classnames, and the value is evaluated as a `ClassValue`.
 *
 * @param values - Any number of class values to process
 * @returns Classnames merged with `twMerge` into a single string
 *
 * @example
 * ```ts
 * cd({ "active": isActive, "disabled": false })
 * // => "active" (if isActive is true)
 *
 * cd(
 *   { layout: ["flex", "items-center"] },
 *   isVisible && "visible",
 *   () => isDark ? "dark" : "light"
 * )
 * // => "flex items-center visible dark"
 * ```
 */
export function cd(...values: ClassValue[]): string {
  return twMerge(cda(...values));
}
