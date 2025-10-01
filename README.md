# No More Tailwind Chaos

Frontend development is cool and all, but have you ever come across things like this:

```ts
base: "peer/menu-button outline-hidden ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground group-has-data-[sidebar=menu-action]/menu-item:pr-8 data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm transition-[width,height,padding] focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:font-medium [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0"
```

And just thought maybe, maybe, peanut farming didn't sound so bad after all?

If you did, welcome to the club of non-psychopaths. We're pleased to make your acquaintance.

# Organizing Classnames

`class-dict` (`cd` for short) is a small library that allows you to transform the chaos of the above to this:

```ts
base: cd(
      {
        "hover": [
          "hover:bg-sidebar-accent",
          "hover:text-sidebar-accent-foreground",
        ],
        "active": [
          "active:bg-sidebar-accent",
          "active:text-sidebar-accent-foreground",
          "data-[state=open]:hover:text-sidebar-accent-foreground",
          "data-[state=open]:hover:bg-sidebar-accent",
          "data-[active=true]:bg-sidebar-accent",
        ],
        "border": [
          "rounded-md",
          "outline-hidden",
          "ring-sidebar-ring",
          "focus-visible:ring-2",
        ],
        "disabled": [
          "disabled:pointer-events-none",
          "disabled:opacity-50",
          "aria-disabled:pointer-events-none",
          "aria-disabled:opacity-50",
        ],
        "svg": [
          "[&>svg]:shrink-0",
          "[&>svg]:size-4",
        ],
        "collapsible": [
          "group-data-[collapsible=icon]:size-8!",
          "group-data-[collapsible=icon]:p-2!",
        ],
        "text": [
          "text-left",
          "text-sm",
          "data-[active=true]:font-medium",
          "data-[active=true]:text-sidebar-accent-foreground",
        ],
        "peer": "peer/menu-button",
        "layout": [
          "flex",
          "w-full",
          "items-center",
          "gap-2",
          "p-2",
          "overflow-hidden",
        ],
        "transition": "transition-[width,height,padding]",
        "last-child": "[&>span:last-child]:truncate",
        "sidebar-menu-action":
          "group-has-data-[sidebar=menu-action]/menu-item:pr-8",
      },
    )
```

# How It Works

The `cd` function can receive any amount of `ClassValue`s:

```ts
type ClassValue =
  | string
  | boolean
  | ClassValue[]
  | ClassDictionary
  | (() => ClassValue)
  | null
  | undefined;
```

But most commonly you would pass a `ClassDictionary` first:

```ts
interface ClassDictionary {
  [key: string]: ClassValue;
}
```

So that you can have a main structure to organize your classnames and then apply overrides later as necessary.

A `ClassDictionary` works like this:

The keys for can be:
- Any arbitrary string (used only for organizing classes)
- The class name(s) to add (if the corresponding value is `=== true`)

The `cd` function will iterate the keys and values in the given object, and it will collect the classnames following this logic:

- If the value evaluates to a falsy value, it is skipped
- If the value is `=== true`, the **key** will be added to the class names
- If the value is a callback, it will be executed and its return value will be processed in the same way as above

Once the list of classnames is complete, it will then call `twMerge` on it, and return the output string.

Example:

```ts
import { assert, it } from "vitest";
import { cd } from "./index.js";

it("just works", async () => {
  const pizza_and_pineapple_yummy = false;
  const snake_case_supremacy = true;

  const example = cd(
    {
      // Value is false, so key is skipped
      "px-2 border-3 flex flex-col": pizza_and_pineapple_yummy,

      // Value is true, so key is kept
      "grid m-4": snake_case_supremacy,

      // Plain string
      "padding": "px-1 py-3",

      // Array with `ClassValue` items
      "margin": [
        pizza_and_pineapple_yummy && "mx-1",
        snake_case_supremacy && "my-3",
      ],

      // Callback that returns a `ClassValue`
      "border": () => {
        if (snake_case_supremacy) {
          return "border-b";
        } else {
          return "border-l";
        }
      },

      // Nested `ClassDictionary`
      "transition": {
        "text-sm text-white": pizza_and_pineapple_yummy,
      },
    },
    // Other overrides can follow (most commonly with inherited props)
    "gap-3 bg-white",
  );

  assert(example === "grid m-4 px-1 py-3 my-3 border-b gap-3 bg-white");
});
```

The other functions being exported are:

- `cda`, which returns the array of classnames without calling `twMerge` with it

# Lsp Integration

You can add `class-dict`'s functions to the list of functions accepted by the tailwind LSP so that you can have those sweet, sweet autocomplete suggestions for class names inside function calls.

Example for Neovim:

```lua
vim.lsp.config("tailwindcss", {
  settings = {
    tailwindCSS = {
      classFunctions = { "cd" },
    },
  },
})
```

For Vscode:

```json
{
  "tailwindCSS.classFunctions": [ "cd" ]
}
```
