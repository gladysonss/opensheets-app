
import { detectInstallment, normalizeInstallments } from "./lib/lancamentos/import-helpers";

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
        console.log(`"${desc}" ->`, detectInstallment(desc));
    });
};

runTests();
