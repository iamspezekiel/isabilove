import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export interface GenerateMessageRequest {
  contact: {
    name: string;
    relationship: string;
    loveLanguage?: string;
    preferences?: {
      favoriteFlowers?: string;
      favoriteTreats?: string;
      favoriteColors?: string;
      hobbies?: string;
      dislikes?: string;
    };
    memories?: string[];
    importantNotes?: string;
  };
  occasion: string;
  customOccasionTitle?: string;
  tone: string;
  length?: "short" | "standard" | "heartfelt";
  religion?: "christianity" | "muslim" | "none";
  gender?: "female" | "male" | "prefer_not_to_say";
  scriptureTranslation?: string;
}

function getFallbackMessage(req: GenerateMessageRequest): {
  message: string;
  alternative: string;
  suggestedGifts: string[];
  deliveryTip: string;
} {
  const { contact, occasion, tone, religion } = req;
  const name = contact.name || "my love";
  const occasionTitle = req.customOccasionTitle || occasion.replace("_", " ");

  let message = `Happy ${occasionTitle}, ${name}! You bring so much light and meaning into my life. Every day with you is a gift, and today I'm taking a moment to celebrate everything that makes you so wonderful.`;
  let alternative = `Thinking about you on this special ${occasionTitle}, ${name}. Thank you for always being your incredible self. Sending you the warmest hug and deepest appreciation today!`;

  if (religion === "muslim") {
    if (tone === "grateful") {
      message = `Dearest ${name}, on this ${occasionTitle}, I pray that Allah blesses you with abundant peace, good health, and barakah. You are a true blessing in my life, and I thank Allah for your noble presence and steadfast kindness.`;
      alternative = `Assalamu Alaikum and happy ${occasionTitle}, ${name}. May Allah shower your days with mercy and reward you generously for all the goodness you bring to our family and circle.`;
    } else if (tone === "romantic") {
      message = `Happy ${occasionTitle}, my beloved ${name}. May Allah always preserve the tranquility, love, and mercy between our hearts. With each passing day, I thank Allah for blessing me with your devotion, your smile, and your gentle spirit.`;
      alternative = `To the love of my life on our ${occasionTitle}: May Allah protect our home and grant us peace in this life and the next. You are my greatest joy, ${name}.`;
    } else if (tone === "playful") {
      message = `Happy ${occasionTitle}, ${name}! Look at you, gracefully tolerating me for another year! In all seriousness, life would be so dull without your laughter. May Allah keep you smiling always!`;
      alternative = `Alert: Today is officially ${name} Appreciation Day! Happy ${occasionTitle}! I promise to let you pick the treats today. Cheers to my favorite human!`;
    } else if (tone === "poetic") {
      message = `For ${name}, on this ${occasionTitle}: Like a cool breeze at dusk, your presence brings tranquility to every room you enter. May Allah bless your path with light and fill your days with peace.`;
      alternative = `Shared smiles, quiet prayers, and unspoken trust—these are our sweetest havens. Happy ${occasionTitle}, ${name}. May Allah grant you joy at every turn.`;
    } else if (tone === "pidgin") {
      message = `My person! Happy ${occasionTitle}, ${name}! As Allah dey bless you, no sorrow go near you at all o. Chop life well well today, you get special place for my heart!`;
      alternative = `Abeg clear road for ${name} today! Happy ${occasionTitle}! May Allah continue to guide and protect you always. I dey solid for your back!`;
    }
  }

  return { message, alternative, suggestedGifts: [], deliveryTip: "" };
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateMessageRequest = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const fallback = getFallbackMessage(body);
      return NextResponse.json(fallback);
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Write a heartfelt message for the following occasion:
Occasion: ${body.occasion}
${body.customOccasionTitle ? `Custom title: ${body.customOccasionTitle}` : ""}
Tone: ${body.tone}
Length: ${body.length || "standard"}
Contact name: ${body.contact.name}
Relationship: ${body.contact.relationship}
${body.contact.loveLanguage ? `Love language: ${body.contact.loveLanguage}` : ""}
${body.contact.memories ? `Shared memories: ${body.contact.memories.join(", ")}` : ""}
${body.contact.importantNotes ? `Important notes: ${body.contact.importantNotes}` : ""}
Religion: ${body.religion || "none"}

Write a warm, personal message suitable for this occasion and relationship.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const message = response.text || "";

    return NextResponse.json({
      message,
      alternative: message,
      suggestedGifts: [],
      deliveryTip: "",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to generate message" },
      { status: 500 }
    );
  }
}