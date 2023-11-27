type TSArray = TemplateStringsArray;
type PH = string | number;

/**
 * Expression interpolation.
 * @param literals string array with raw properties
 * @param placeholders related to the expressions
 */
function resolveInterpolation(literals: TSArray, ...placeholders: PH[]): string {
  return literals.raw.reduce((s, l) => (s += l + (placeholders.shift() ?? '')), '');
}

/**
 * It can be used as a function or a template literal tag.
 * Detects a common minimal indent of all the input lines, removes it from every line and also removes the first and the last lines if they are blank.
 * @param string target string
 * @example
 * const s = trimIndent(`
 *   ABC
 *   123
 *   456
 * `);
 */
export function trimIndent(string: string): string;

/**
 * It can be used as a function or a template literal tag.
 * Detects a common minimal indent of all the input lines, removes it from every line and also removes the first and the last lines if they are blank.
 * @example
 * const s = trimIndent`
 *   ABC
 *   123
 *   456
 * `;
 */
export function trimIndent(literals: TSArray, ...placeholders: PH[]): string;

export function trimIndent(arg1: string | TSArray, arg2: PH = '', ...args: PH[]): string {
  const string = typeof arg1 === 'string' ? arg1 : resolveInterpolation(arg1, arg2, ...args);
  const lines = string.split('\n');
  if (!lines?.[0].trim()) lines.shift();
  if (!lines?.[lines.length - 1].trim()) lines.pop();
  const indent = Math.min(...lines.filter(s => s.trim()).map(s => /^\s+/.exec(s)?.[0].length ?? 0));
  return lines.reduce((s, l) => (s += l.slice(indent) + '\n'), '').slice(0, -1);
}
