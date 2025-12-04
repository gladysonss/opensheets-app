import { getApiDocs } from "../lib/swagger";
import fs from "fs";
import path from "path";

async function generateSwagger() {
  try {
    const spec = await getApiDocs();
    const outputPath = path.join(process.cwd(), "public", "swagger.json");
    
    fs.writeFileSync(outputPath, JSON.stringify(spec, null, 2));
    console.log(`Swagger spec generated at ${outputPath}`);
  } catch (error) {
    console.error("Error generating Swagger spec:", error);
    process.exit(1);
  }
}

generateSwagger();
