import { execSync } from "child_process";
import fs from "fs";
import path from "path";

interface ChangelogEntry {
  id: string;
  type: string;
  title: string;
  date: string;
  icon: string;
  category: string;
}

function getIcon(type: string): string {
  const icons: Record<string, string> = {
    feat: "✨",
    fix: "🐛",
    perf: "🚀",
    docs: "📝",
    style: "🎨",
    refactor: "♻️",
    test: "🧪",
    chore: "🔧",
  };
  return icons[type] || "📦";
}

function getCategory(type: string): string {
  const categories: Record<string, string> = {
    feat: "feature",
    fix: "bugfix",
    perf: "performance",
    docs: "documentation",
    style: "style",
    refactor: "refactor",
    test: "test",
    chore: "chore",
  };
  return categories[type] || "other";
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    feature: "Novidades",
    bugfix: "Correções",
    performance: "Performance",
    documentation: "Documentação",
    style: "Interface",
    refactor: "Melhorias",
    test: "Testes",
    chore: "Manutenção",
    other: "Outros",
  };
  return labels[category] || "Outros";
}

function generateChangelog() {
  try {
    console.log("🔍 Gerando changelog dos últimos commits...\n");

    // Pega commits dos últimos 30 dias
    const gitCommand =
      'git log --since="30 days ago" --pretty=format:"%H|%s|%ai" --no-merges';

    let output: string;
    try {
      output = execSync(gitCommand, { encoding: "utf-8" });
    } catch (error) {
      console.warn("⚠️  Não foi possível acessar o Git. Gerando changelog vazio.");
      output = "";
    }

    if (!output.trim()) {
      console.log("ℹ️  Nenhum commit encontrado nos últimos 30 dias.");
      const emptyChangelog = {
        version: "1.0.0",
        generatedAt: new Date().toISOString(),
        entries: [],
      };

      const publicDir = path.join(process.cwd(), "public");
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }

      fs.writeFileSync(
        path.join(publicDir, "changelog.json"),
        JSON.stringify(emptyChangelog, null, 2)
      );
      return;
    }

    const commits = output
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        const [hash, message, date] = line.split("|");
        return { hash, message, date };
      });

    console.log(`📝 Processando ${commits.length} commits...\n`);

    // Parseia conventional commits
    const entries: ChangelogEntry[] = commits
      .map((commit) => {
        // Match conventional commit format: type: message
        const match = commit.message.match(
          /^(feat|fix|perf|docs|style|refactor|test|chore):\s*(.+)$/
        );

        if (!match) {
          // Ignora commits que não seguem o padrão
          return null;
        }

        const [, type, title] = match;

        return {
          id: commit.hash,
          type,
          title: title.trim(),
          date: commit.date,
          icon: getIcon(type),
          category: getCategory(type),
        };
      })
      .filter((entry): entry is ChangelogEntry => entry !== null);

    console.log(`✅ ${entries.length} commits válidos encontrados\n`);

    // Agrupa por categoria
    const grouped = entries.reduce(
      (acc, entry) => {
        if (!acc[entry.category]) {
          acc[entry.category] = [];
        }
        acc[entry.category].push(entry);
        return acc;
      },
      {} as Record<string, ChangelogEntry[]>
    );

    // Mostra resumo
    Object.entries(grouped).forEach(([category, items]) => {
      console.log(
        `${getIcon(items[0].type)} ${getCategoryLabel(category)}: ${items.length}`
      );
    });

    // Pega versão do package.json
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "package.json"), "utf-8")
    );

    const changelog = {
      version: packageJson.version || "1.0.0",
      generatedAt: new Date().toISOString(),
      entries: entries.slice(0, 20), // Limita a 20 mais recentes
    };

    // Salva em public/changelog.json
    const publicDir = path.join(process.cwd(), "public");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const changelogPath = path.join(publicDir, "changelog.json");
    fs.writeFileSync(changelogPath, JSON.stringify(changelog, null, 2));

    console.log(`\n✅ Changelog gerado com sucesso em: ${changelogPath}`);
  } catch (error) {
    console.error("❌ Erro ao gerar changelog:", error);
    // Não falha o build, apenas avisa
    process.exit(0);
  }
}

generateChangelog();
