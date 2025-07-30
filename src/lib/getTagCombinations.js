export default function getTagCombinations(tags) {
    const combinations = [];
  
    const generate = (prefix, remaining) => {
      for (let i = 0; i < remaining.length; i++) {
        const newCombo = [...prefix, remaining[i]];
        combinations.push(newCombo);
        generate(newCombo, remaining.slice(i + 1));
      }
    };
  
    generate([], tags);
    return combinations;
  }