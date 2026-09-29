/**
 * Set a nested property on a deeply cloned object using dot-notation path.
 * setNested({ a: { b: 1 } }, 'a.b', 2) → { a: { b: 2 } }
 */
export function setNested(obj, path, value) {
  const cloned = JSON.parse(JSON.stringify(obj));
  const keys = path.split('.');
  let current = cloned;
  for (let i = 0; i < keys.length - 1; i++) {
    current[keys[i]] = current[keys[i]] ?? {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
  return cloned;
}
