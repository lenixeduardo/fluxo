// src/lib/anthropic.ts
// Thin wrapper around the Anthropic SDK for server-side AI calls.

import Anthropic from "@anthropic-ai/sdk";
import type { Category } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Classify a transaction description into one of the provided categories.
 * Returns { id, confidence } — called by POST /api/ai/classify
 */
export async function classifyTransaction(
  description: string,
  type: "INCOME" | "EXPENSE",
  categories: Category[]
): Promise<{ id: string; confidence: number }> {
  const opts = categories
    .filter((c) => c.type === type || c.type === "BOTH")
    .map((c) => `${c.id}:${c.name}`)
    .join(", ");

  const message = await client.messages.create({
    model:      "claude-sonnet-4-20250514",
    max_tokens: 80,
    system:
      'Você é um categorizador de transações financeiras. Responda SOMENTE com JSON válido no formato {"id":"<id>","confidence":<número entre 0 e 1>}. Sem texto, markdown ou explicação adicional.',
    messages: [
      {
        role:    "user",
        content: `Descrição: "${description}"\nTipo: ${type === "EXPENSE" ? "Despesa" : "Receita"}\nCategorias: ${opts}\n\nResponda com o JSON da categoria mais adequada.`,
      },
    ],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "{}";

  try {
    return JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch {
    const fallback = categories.find((c) => c.type === type);
    return { id: fallback?.id ?? categories[0].id, confidence: 0.4 };
  }
}
