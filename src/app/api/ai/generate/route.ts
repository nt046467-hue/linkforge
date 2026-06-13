import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUserIdFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.plan !== "pro" && user.aiGenerations >= 3) {
      return NextResponse.json(
        {
          error:
            "AI generation limit reached. Upgrade to Pro for unlimited generations.",
        },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const groqApiKey = process.env.GROQ_API_KEY;

    const fullPrompt = `You are a creative assistant for LinkForge, a bio link builder. Given a user's description, generate profile content.

Respond ONLY with valid JSON, no markdown, no explanation:
{
  "display_name": "name max 30 chars",
  "bio": "bio max 160 chars",
  "tagline": "motto max 60 chars",
  "suggested_links": [
    {"title": "Link Title", "url": "https://example.com", "icon": "🔗"}
  ],
  "theme_recommendation": "dark",
  "accent_color": "#6C47FF"
}

theme must be one of: minimal, dark, gradient, glass, retro

User description: ${prompt}`;

    let content = "";
    let usedModel = "";

    // ── 1st: Try Gemini 2.5 Flash (best quality) ──────────────────
    if (geminiApiKey) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: fullPrompt }] }],
              generationConfig: { temperature: 0.8, maxOutputTokens: 1000 },
            }),
          },
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          content = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
          usedModel = "gemini-2.5-flash";
          console.log("✅ Used Gemini 2.5 Flash");
        } else {
          const err = await geminiRes.text();
          console.warn(
            `⚠️ Gemini failed (${geminiRes.status}), falling back to Groq:`,
            err.slice(0, 200),
          );
        }
      } catch (err) {
        console.warn("⚠️ Gemini request failed, falling back to Groq:", err);
      }
    }

    // ── 2nd: Fallback to Groq (LLaMA 3) if Gemini failed ─────────
    if (!content && groqApiKey) {
      try {
        const groqRes = await fetch(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${groqApiKey}`,
            },
            body: JSON.stringify({
              model: "llama3-8b-8192",
              messages: [{ role: "user", content: fullPrompt }],
              temperature: 0.8,
              max_tokens: 1000,
            }),
          },
        );

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          content = groqData.choices?.[0]?.message?.content || "";
          usedModel = "groq-llama3";
          console.log("✅ Used Groq LLaMA3 fallback");
        } else {
          const err = await groqRes.text();
          console.error("❌ Groq also failed:", err.slice(0, 200));
        }
      } catch (err) {
        console.error("❌ Groq request failed:", err);
      }
    }

    // ── Parse JSON from AI response ───────────────────────────────
    let result;
    if (content) {
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found in response");
        }
      } catch {
        console.error("JSON parse failed, using static fallback");
      }
    }

    // ── 3rd: Static fallback if both AIs fail ────────────────────
    if (!result) {
      usedModel = "fallback";
      result = {
        display_name: user.displayName || user.username,
        bio: prompt.slice(0, 160),
        tagline: "Creating something awesome",
        suggested_links: [
          { title: "My Website", url: "https://example.com", icon: "🌐" },
          { title: "GitHub", url: "https://github.com", icon: "💻" },
          { title: "Twitter", url: "https://twitter.com", icon: "🐦" },
          { title: "LinkedIn", url: "https://linkedin.com", icon: "💼" },
        ],
        theme_recommendation: "dark",
        accent_color: "#6C47FF",
      };
    }

    await db.user.update({
      where: { id: userId },
      data: { aiGenerations: { increment: 1 } },
    });

    return NextResponse.json({
      result,
      generationsUsed: user.aiGenerations + 1,
      model: usedModel,
    });
  } catch (error) {
    console.error("AI generate error:", error);
    return NextResponse.json(
      {
        error: `Server error: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    );
  }
}
