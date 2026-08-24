export const format9DigitId = (id, type = "student") => {
  if (!id && id !== 0) return "100000001";
  const numOnly = parseInt(String(id).replace(/\D/g, "")) || 1;
  
  let basePrefix = 100000000;
  if (type === "group") basePrefix = 200000000;
  else if (type === "teacher") basePrefix = 300000000;
  else if (type === "payment") basePrefix = 800000000;
  else if (type === "room") basePrefix = 500000000;

  if (numOnly >= 100000000) {
    return String(numOnly);
  }
  return String(basePrefix + numOnly);
};

export const formatSpaced9DigitId = (id, type = "student") => {
  const raw9 = format9DigitId(id, type);
  return `${raw9.slice(0, 3)} ${raw9.slice(3, 6)} ${raw9.slice(6, 9)}`;
};
