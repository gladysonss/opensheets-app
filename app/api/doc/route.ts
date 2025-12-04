import { getApiDocs } from "@/lib/swagger";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  // Tenta ler o arquivo gerado no build (produção)
  const filePath = path.join(process.cwd(), "public", "swagger.json");
  
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    return NextResponse.json(JSON.parse(fileContent));
  }

  // Fallback para dev (gera em tempo de execução)
  const spec = await getApiDocs();
  return NextResponse.json(spec);
}
