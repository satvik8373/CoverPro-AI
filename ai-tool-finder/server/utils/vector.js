export const cosineSimilarity = (a = [], b = []) => {
  if (!a.length || !b.length || a.length !== b.length) return -1;

  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    magA += a[i] ** 2;
    magB += b[i] ** 2;
  }

  if (!magA || !magB) return -1;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
};

export const toUnitVector = (values = []) => {
  const mag = Math.sqrt(values.reduce((sum, value) => sum + value ** 2, 0));
  return mag ? values.map((value) => value / mag) : values;
};
