
const normalizeInstallments = (value) => {
  if (!value) return undefined;
  if (typeof value === "number") return value;
  
  const str = String(value).trim().toLowerCase();
  const clean = str.replace(/[^\d]/g, "");
  const num = parseInt(clean, 10);
  return isNaN(num) ? undefined : num;
};

const detectInstallment = (description) => {
  if (!description) return undefined;
  const str = String(description);

  // Patterns: "1/10", "01/12", "(1/5)", "1 de 10"
  const patterns = [
    /(\d{1,2})\s*\/\s*(\d{1,2})/,
    /\(\s*(\d{1,2})\s*\/\s*(\d{1,2})\s*\)/,
    /(\d{1,2})\s*de\s*(\d{1,2})/i,
    /(\d{1,2})\s*x/i, 
  ];

  const xMatch = str.match(/(\d{1,2})\s*x/i);
  if (xMatch) {
     const total = parseInt(xMatch[1], 10);
     if (total > 1) {
       return { current: 1, total };
     }
  }

  for (const pattern of patterns) {
    const match = str.match(pattern);
    if (match && match.length >= 3) {
      const current = parseInt(match[1], 10);
      const total = parseInt(match[2], 10);
      if (current > 0 && total > 0 && current <= total) {
        return { current, total };
      }
    }
  }

  return undefined;
};

const runTests = () => {
    console.log("--- Testing normalizeInstallments ---");
    const installmentTests = ["10", "10x", "10X", " 10 ", "10 parcelas", "1/10"];
    installmentTests.forEach(val => {
        console.log(`"${val}" ->`, normalizeInstallments(val));
    });

    console.log("\n--- Testing detectInstallment ---");
    const descriptionTests = [
        "Compra 01/10",
        "Compra 1/10",
        "Compra (01/10)",
        "Compra 1 de 10",
        "Compra 10x",
        "Compra 10X",
        "Parcela 10x na loja",
        "10x sem juros"
    ];
    descriptionTests.forEach(desc => {
        console.log(`"${desc}" ->`, JSON.stringify(detectInstallment(desc)));
    });
};

runTests();
