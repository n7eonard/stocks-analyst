import Anthropic from "@anthropic-ai/sdk";
import { analystsByKey } from "@/data/analysts";

export const runtime = "edge";

export async function POST(req: Request) {
  const { ticker, analystKeys } = await req.json();

  if (!ticker || !analystKeys || !Array.isArray(analystKeys)) {
    return new Response(
      JSON.stringify({ error: "Missing ticker or analystKeys" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Validate analyst keys
  const validKeys = analystKeys.filter((k: string) => analystsByKey[k]);
  if (validKeys.length === 0) {
    return new Response(
      JSON.stringify({ error: "No valid analyst keys" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "API key not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: unknown) {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      }

      const client = new Anthropic({ apiKey });

      // Run all analysts in parallel
      const promises = validKeys.map(async (analystKey: string) => {
        const analyst = analystsByKey[analystKey];
        if (!analyst) return;

        send("analyst-start", { analyst: analystKey });

        try {
          const stream = await client.messages.stream({
            model: "claude-sonnet-4-5-20250929",
            max_tokens: 4096,
            system: analyst.systemPrompt,
            messages: [
              {
                role: "user",
                content: `The stock: ${ticker}. Please provide your complete analysis now.`,
              },
            ],
          });

          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              send("analyst-chunk", {
                analyst: analystKey,
                content: event.delta.text,
              });
            }
          }

          send("analyst-complete", { analyst: analystKey });
        } catch (error) {
          send("analyst-error", {
            analyst: analystKey,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      });

      await Promise.all(promises);
      send("all-complete", {});
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
