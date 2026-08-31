/**
 * Index into a non-empty list, wrapping at both ends.
 *
 * The repo compiles with `noUncheckedIndexedAccess`, so `list[i]` is
 * `T | undefined` even where the modulo makes that impossible. This keeps that
 * setting earning its keep - it catches real off-by-ones elsewhere - without
 * scattering non-null assertions through the scene, and it fixes negative
 * indices at the same time, which `%` alone does not.
 */
export const cycle = <T>(items: readonly [T, ...T[]], index: number): T =>
  items[((index % items.length) + items.length) % items.length] ?? items[0];
