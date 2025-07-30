export default function getTagCombinations(tags) {
  const combinations = [];

  // Step 1: Deduplicate and sort
  const uniqueTags = Array.from(new Set(tags)).sort((a, b) => a.localeCompare(b));

  // Step 2: Generate all combinations (length 1 to N)
  const generate = (prefix, remaining, startIndex) => {
    for (let i = startIndex; i < remaining.length; i++) {
      const newCombo = [...prefix, remaining[i]];
      combinations.push(newCombo);
      generate(newCombo, remaining, i + 1);
    }
  };

  generate([], uniqueTags, 0);

  return combinations;
}
