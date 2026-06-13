import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUserIdFromRequest } from "@/lib/auth";

// POST /api/ai/generate - Generate AI content using Gemini
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

    // Check generation limits
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

    const systemPrompt = `You are a creative assistant for LinkForge, a bio link builder. Given a user's description of themselves, generate profile content.

Respond ONLY with valid JSON in this exact format, no markdown, no explanation:
{
  "display_name": "short name max 30 chars",
  "bio": "compelling bio max 160 chars",
  "tagline": "short motto max 60 chars",
  "suggested_links": [
    {"title": "Link Title", "url": "https://example.com", "icon": "🔗"}
  ],
  "theme_recommendation": "dark",
  "accent_color": "#6C47FF"
}

theme_recommendation must be one of: minimal, dark, gradient, glass, retro
suggested_links should have 4-5 items relevant to the user's description.`;

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      // Fallback result if no API key
      const result = {
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
      return NextResponse.json({
        result,
        generationsUsed: user.aiGenerations + 1,
      });
    }

    // Call Gemini API
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt + "\n\nUser description: " + prompt },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 1000,
          },
        }),
      },
    );

    if (!geminiRes.ok) {
      throw new Error(`Gemini API error: ${geminiRes.status}`);
    }

    const geminiData = await geminiRes.json();
    const content = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON in response");
      }
    } catch {
      // Fallback if parsing fails
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

    // Increment AI generations counter
    await db.user.update({
      where: { id: userId },
      data: { aiGenerations: { increment: 1 } },
    });

    return NextResponse.json({
      result,
      generationsUsed: user.aiGenerations + 1,
    });
  } catch (error) {
    console.error("AI generate error:", error);
    return NextResponse.json(
      { error: "AI generation failed. Please try again." },
      { status: 500 },
    );
  }
}
