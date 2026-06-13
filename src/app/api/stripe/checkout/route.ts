import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUserIdFromRequest } from "@/lib/auth";
import Stripe from "stripe";

// POST /api/stripe/checkout - Create a Stripe Checkout session
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

    if (user.plan === "pro") {
      return NextResponse.json(
        { error: "Already on Pro plan" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const { planType } = body as { planType: "monthly" | "yearly" };

    // Check if Stripe secret key is configured
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey || stripeSecretKey === "sk_test_placeholder") {
      // Demo mode — just upgrade the user directly (no real payment)
      await db.user.update({
        where: { id: userId },
        data: { plan: "pro" },
      });

      return NextResponse.json({
        url: null,
        demoMode: true,
        message:
          "Demo mode — Pro plan activated! Add STRIPE_SECRET_KEY to .env for real payments.",
      });
    }

    // Real Stripe checkout
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2026-05-27.dahlia",
    });

    // Price IDs from your Stripe dashboard
    const priceId =
      planType === "yearly"
        ? process.env.STRIPE_YEARLY_PRICE_ID
        : process.env.STRIPE_MONTHLY_PRICE_ID;

    if (!priceId) {
      return NextResponse.json(
        {
          error:
            "Stripe price not configured. Add STRIPE_MONTHLY_PRICE_ID and STRIPE_YEARLY_PRICE_ID to .env",
        },
        { status: 500 },
      );
    }

    // Create or retrieve Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.displayName || user.username,
        metadata: { userId: user.id, username: user.username },
      });
      customerId = customer.id;
      await db.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    // Get the origin for redirect URLs
    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    // Create Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/?stripe_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?stripe_cancel=true`,
      metadata: {
        userId: user.id,
        planType,
      },
      subscription_data: {
        metadata: { userId: user.id },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
