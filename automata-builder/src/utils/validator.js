export function validateAutomaton(type, states, transitions, alphabet) {
  const errors = [];

  if (!Array.isArray(states) || !Array.isArray(transitions) || !Array.isArray(alphabet)) {
    errors.push("Internal validation error: invalid input types.");
    return errors;
  }

  if (type === "NFA") {
    for (const t of transitions) {
      if (t.label === "ε") {
        errors.push("NFA must not contain ε-transitions.");
      }
    }
  }

  return errors;
}
