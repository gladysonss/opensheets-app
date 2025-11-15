/**
 * Tipos de providers disponíveis
 */
export type AIProvider = "openai" | "anthropic" | "google" | "openrouter";

/**
 * Metadados dos providers
 */
export const PROVIDERS = {
  openai: {
    id: "openai" as const,
    name: "ChatGPT",
    icon: "RiOpenaiLine",
  },
  anthropic: {
    id: "anthropic" as const,
    name: "Claude AI",
    icon: "RiRobot2Line",
  },
  google: {
    id: "google" as const,
    name: "Gemini",
    icon: "RiGoogleLine",
  },
  openrouter: {
    id: "openrouter" as const,
    name: "OpenRouter",
    icon: "RiRouterLine",
  },
} as const;

/**
 * Lista de modelos de IA disponíveis para análise de insights
 */
export const AVAILABLE_MODELS = [
  // OpenAI Models (5)
  { id: "gpt-5", name: "GPT-5", provider: "openai" as const },
  { id: "gpt-5-mini", name: "GPT-5 Mini", provider: "openai" as const },
  { id: "gpt-5-nano", name: "GPT-5 Nano", provider: "openai" as const },
  { id: "gpt-4.1", name: "GPT-4.1", provider: "openai" as const },
  { id: "gpt-4o", name: "GPT-4o (Omni)", provider: "openai" as const },

  // Anthropic Models (5)
  {
    id: "claude-3.7-sonnet",
    name: "Claude 3.7 Sonnet",
    provider: "anthropic" as const,
  },
  {
    id: "claude-4-opus",
    name: "Claude 4 Opus",
    provider: "anthropic" as const,
  },
  {
    id: "claude-4.5-sonnet",
    name: "Claude 4.5 Sonnet",
    provider: "anthropic" as const,
  },
  {
    id: "claude-4.5-haiku",
    name: "Claude 4.5 Haiku",
    provider: "anthropic" as const,
  },
  {
    id: "claude-3.5-sonnet-20240620",
    name: "Claude 3.5 Sonnet (2024-06-20)",
    provider: "anthropic" as const,
  },

  // Google Models (5)
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "google" as const,
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "google" as const,
  },
] as const;

/**
 * Modelo padrão
 */
export const DEFAULT_MODEL = "gpt-5";
export const DEFAULT_PROVIDER = "openai";

/**
 * System prompt para análise de insights
 */
export const INSIGHTS_SYSTEM_PROMPT = `Você é um especialista em comportamento financeiro. Analise os dados financeiros fornecidos e organize suas observações em 4 categorias específicas:

1. **Comportamentos Observados** (behaviors): Padrões de gastos e hábitos financeiros identificados nos dados. Foque em comportamentos recorrentes e tendências. Considere:
   - Tendência dos últimos 3 meses (crescente, decrescente, estável)
   - Gastos recorrentes e sua previsibilidade
   - Padrões de parcelamento e comprometimento futuro

2. **Gatilhos de Consumo** (triggers): Identifique situações, períodos ou categorias que desencadeiam maiores gastos. O que leva o usuário a gastar mais? Analise:
   - Dias da semana com mais gastos
   - Categorias que cresceram nos últimos meses
   - Métodos de pagamento que facilitam gastos

3. **Recomendações Práticas** (recommendations): Sugestões concretas e acionáveis para melhorar a saúde financeira. Seja específico e direto. Use os dados de:
   - Gastos recorrentes que podem ser otimizados
   - Orçamentos que estão sendo ultrapassados
   - Comprometimento futuro com parcelamentos

4. **Melhorias Sugeridas** (improvements): Oportunidades de otimização e estratégias de longo prazo para alcançar objetivos financeiros. Considere:
   - Tendências preocupantes dos últimos 3 meses
   - Percentual de gastos recorrentes vs pontuais
   - Estratégias para reduzir comprometimento futuro

Para cada categoria, forneça de 3 a 6 itens concisos e objetivos. Use linguagem clara e direta, com verbos de ação. Mantenha privacidade e não exponha dados pessoais sensíveis.

IMPORTANTE: Utilize os novos dados disponíveis (threeMonthTrend, recurringExpenses, installments) para fornecer insights mais ricos e contextualizados.

Responda EXCLUSIVAMENTE com um JSON válido seguindo o esquema:
{
  "month": "YYYY-MM",
  "generatedAt": "ISO datetime",
  "categories": [
    {
      "category": "behaviors",
      "items": [
        { "text": "Observação aqui" },
        ...
      ]
    },
    {
      "category": "triggers",
      "items": [...]
    },
    {
      "category": "recommendations",
      "items": [...]
    },
    {
      "category": "improvements",
      "items": [...]
    }
  ]
}

`;
