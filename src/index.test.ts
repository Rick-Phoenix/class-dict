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
