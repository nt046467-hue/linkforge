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
    console.log("GEMINI_API_KEY present:", !!geminiApiKey);

    if (!geminiApiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured on server" },
        { status: 500 },
      );
    }

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

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 1000 },
        }),
      },
    );

    console.log("Gemini response status:", geminiRes.status);

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API error:", errText);
      return NextResponse.json(
        { error: `Gemini API error: ${geminiRes.status} - ${errText}` },
        { status: 500 },
      );
    }

    const geminiData = await geminiRes.json();
    const content = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("Gemini content received, length:", content.length);

    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON in response");
      }
    } catch {
      result = {
        display_name: user.displayName || user.username,
        bio: prompt.slice(0, 160),
        tagline: "Creating something awesome",
        suggested_links: [
          { title: "My Website", url: "https://example.com", icon: "🌐" },
          { title: "GitHub", url: "https://github.com", icon: "💻" },
          { title: "Twitter", url: "https://twitter.com", icon: "🐦" },
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
    });
  } catch (error) {
    console.error("AI generate error full:", error);
    return NextResponse.json(
      {
        error: `Server error: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    );
  }
}
