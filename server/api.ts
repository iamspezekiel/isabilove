import { GoogleGenAI } from "@google/genai";
import type { Request, Response } from "express";

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
  length?: 'short' | 'standard' | 'heartfelt';
  religion?: 'christianity' | 'muslim' | 'none';
  gender?: 'female' | 'male' | 'prefer_not_to_say';
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
  const occasionTitle = req.customOccasionTitle || occasion.replace('_', ' ');

  let message = `Happy ${occasionTitle}, ${name}! You bring so much light and meaning into my life. Every day with you is a gift, and today I'm taking a moment to celebrate everything that makes you so wonderful.`;
  let alternative = `Thinking about you on this special ${occasionTitle}, ${name}. Thank you for always being your incredible self. Sending you the warmest hug and deepest appreciation today!`;
  
  if (religion === 'muslim') {
    if (tone === 'grateful') {
      message = `Dearest ${name}, on this ${occasionTitle}, I pray that Allah blesses you with abundant peace, good health, and barakah. You are a true blessing in my life, and I thank Allah for your noble presence and steadfast kindness.`;
      alternative = `Assalamu Alaikum and happy ${occasionTitle}, ${name}. May Allah shower your days with mercy and reward you generously for all the goodness you bring to our family and circle.`;
    } else if (tone === 'romantic') {
      message = `Happy ${occasionTitle}, my beloved ${name}. May Allah always preserve the tranquility, love, and mercy between our hearts. With each passing day, I thank Allah for blessing me with your devotion, your smile, and your gentle spirit.`;
      alternative = `To the love of my life on our ${occasionTitle}: May Allah protect our home and grant us peace in this life and the next. You are my greatest joy, ${name}.`;
    } else if (tone === 'playful') {
      message = `Happy ${occasionTitle}, ${name}! Look at you, gracefully tolerating me for another year! In all seriousness, life would be so dull without your laughter. May Allah keep you smiling always!`;
      alternative = `Alert: Today is officially ${name} Appreciation Day! Happy ${occasionTitle}! I promise to let you pick the treats today. Cheers to my favorite human!`;
    } else if (tone === 'poetic') {
      message = `For ${name}, on this ${occasionTitle}: Like a cool breeze at dusk, your presence brings tranquility to every room you enter. May Allah bless your path with light and fill your days with peace.`;
      alternative = `Shared smiles, quiet prayers, and unspoken trust—these are our sweetest havens. Happy ${occasionTitle}, ${name}. May Allah grant you joy at every turn.`;
    } else if (tone === 'pidgin') {
      message = `My person! Happy ${occasionTitle}, ${name}! As Allah dey bless you, no sorrow go near you at all o. Chop life well well today, you get special place for my heart!`;
      alternative = `Abeg clear road for ${name} today! Happy ${occasionTitle}! May Allah continue to guide and protect you always. I dey solid for your back!`;
    }
  } else if (religion === 'none') {
    if (tone === 'grateful') {
      message = `Dearest ${name}, on this ${occasionTitle}, I simply wanted to express how deeply thankful I am for your presence in my life. You have consistently stood by me with unwavering support, honesty, and kindness. You are a true treasure.`;
      alternative = `Happy ${occasionTitle}, ${name}. Life has its ups and downs, but having someone as grounding, dependable, and loving as you makes all the difference. Thank you for everything you do.`;
    } else if (tone === 'romantic') {
      message = `Happy ${occasionTitle}, my darling ${name}. You hold my whole heart, and with each passing season I fall deeper in love with your kindness, your laughter, and the warmth you bring into my world. Thank you for being my anchor.`;
      alternative = `To the love of my life on our ${occasionTitle}: every quiet moment, every shared laugh, and every step with you is my greatest gift. I love you more than words could ever convey, ${name}.`;
    } else if (tone === 'playful') {
      message = `Happy ${occasionTitle}, ${name}! Look at you, gracefully tolerating me for another year. Life would be immensely boring without your chaotic energy and contagious laugh. Let's celebrate properly today!`;
      alternative = `Alert: Today is officially ${name} Appreciation Day! Happy ${occasionTitle}! I promise to let you pick the snacks and have the final say on the playlist today. Cheers to my favorite human!`;
    } else if (tone === 'poetic') {
      message = `For ${name}, on this ${occasionTitle}: Some people walk into a room and the light changes. That has always been you for me. Today we celebrate the beauty and depth you weave into ordinary days. May your year ahead be luminous.`;
      alternative = `Quiet mornings, shared stories, and the unspoken understanding between us—these are my favorite havens. Happy ${occasionTitle}, ${name}. May happiness find you at every turn.`;
    } else if (tone === 'pidgin') {
      message = `My person! Happy ${occasionTitle}, ${name}! No be small thing to get someone like you for this life o. As today na your special day, chop life well well and know say you get special place for my heart always!`;
      alternative = `Abeg make everybody clear road for ${name} today! Happy ${occasionTitle}! Your joy and sweet energy dey always bring peace. Enjoy your day to the fullest, I dey solid for your back anytime!`;
    }
  } else {
    // Christianity default
    if (tone === 'romantic') {
      message = `Happy ${occasionTitle}, my darling ${name}. You hold my whole heart, and with each passing season I fall deeper in love with your kindness, your laughter, and the warmth you bring into my world. Thank you for being my home.`;
      alternative = `To the love of my life on our ${occasionTitle}: every quiet moment, every loud laugh, and every step with you is my greatest gift. I love you more than words could ever convey, ${name}.`;
    } else if (tone === 'playful') {
      message = `Happy ${occasionTitle}, ${name}! Look at you, gracefully tolerating me for another year. In all seriousness, life would be immensely boring without your chaotic energy and contagious laugh. Let's celebrate properly today!`;
      alternative = `Alert: Today is officially ${name} Appreciation Day! Happy ${occasionTitle}! I promise to let you pick the snacks and have the final say on the playlist today. Cheers to my favorite human!`;
    } else if (tone === 'grateful') {
      message = `Dearest ${name}, on this ${occasionTitle}, I simply wanted to express how deeply thankful I am for your presence in my life. You have consistently stood by me with unwavering support and patience. You are a true treasure.`;
      alternative = `Happy ${occasionTitle}, ${name}. Life has its ups and downs, but having someone as grounding, dependable, and loving as you makes all the difference. Thank you for everything you do.`;
    } else if (tone === 'poetic') {
      message = `For ${name}, on this ${occasionTitle}: Some people walk into a room and the light changes. That has always been you for me. Today we celebrate the beauty and depth you weave into ordinary days. May your year ahead be as luminous as your soul.`;
      alternative = `Quiet mornings, shared stories, and the unspoken understanding between us—these are my favorite havens. Happy ${occasionTitle}, ${name}. May happiness find you at every turn.`;
    } else if (tone === 'pidgin') {
      message = `My person! Happy ${occasionTitle}, ${name}! No be small thing to get someone like you for this life o. As today na your special day, chop life well well and know say you get special place for my heart always!`;
      alternative = `Abeg make everybody clear road for ${name} today! Happy ${occasionTitle}! Your joy and sweet energy dey always bring peace. Enjoy your day to the fullest, I dey solid for your back anytime!`;
    }
  }

  const gifts: string[] = [];
  if (contact.preferences?.favoriteFlowers) {
    gifts.push(`A fresh bouquet featuring ${contact.preferences.favoriteFlowers}`);
  } else {
    gifts.push("A hand-tied seasonal bouquet with a personalized wax-sealed note");
  }

  if (contact.preferences?.favoriteTreats) {
    gifts.push(`A curated gift box containing their favorite treat: ${contact.preferences.favoriteTreats}`);
  } else {
    gifts.push("An artisanal dessert tasting box from a local boutique bakery");
  }

  if (contact.loveLanguage === 'quality_time') {
    gifts.push("A surprise unplugged dinner date or picnic afternoon at a scenic spot");
  } else if (contact.loveLanguage === 'acts_of_service') {
    gifts.push("A handwritten coupon book handling their most tedious weekly errands");
  } else {
    gifts.push("A framed photo memory from a memorable trip together");
  }

  return {
    message,
    alternative,
    suggestedGifts: gifts,
    deliveryTip: "Deliver in the morning or early evening with their favorite warm beverage."
  };
}

export async function handleGenerateMessage(req: Request, res: Response) {
  try {
    const body: GenerateMessageRequest = req.body;
    if (!body || !body.contact) {
      return res.status(400).json({ error: "Contact details are required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY not configured, using smart contextual fallback template");
      const fallback = getFallbackMessage(body);
      return res.json({ ...fallback, source: "template" });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const memoryContext = body.contact.memories && body.contact.memories.length > 0
      ? `Shared Memories / Inside Stories: ${body.contact.memories.join("; ")}`
      : "";

    const prefContext = body.contact.preferences
      ? `Favorite flowers: ${body.contact.preferences.favoriteFlowers || 'N/A'}, Favorite treats/food: ${body.contact.preferences.favoriteTreats || 'N/A'}, Hobbies: ${body.contact.preferences.hobbies || 'N/A'}, Dislikes/Avoid: ${body.contact.preferences.dislikes || 'N/A'}`
      : "";

    const religionInstruction = body.religion === 'muslim'
      ? "4. Scribe Faith Grounding: The sender is Muslim. Naturally infuse authentic Islamic devotional warmth, prayers of peace, barakah, and gentle affection (such as 'Assalamu Alaikum', 'May Allah bless you with peace and goodness', 'Barakallahu Feek', Quranic wisdom on love, mercy, and tranquility, or Hadith on family kindness). Never cite Christian dogmas or biblical scriptures."
      : body.religion === 'none'
      ? "4. Scribe Faith Grounding: The sender has no religion (secular/humanist). Craft the epistle focused purely on heartfelt human appreciation, gratitude, authentic connection, deep loyalty, and poetic reflection without any religious prayers, scriptures, or religious dogma."
      : `4. Scribe Faith Grounding: The sender is Christian. Infuse heartfelt Christian devotional warmth and grace. If citing scriptures or proverbs, cite the ${body.scriptureTranslation || 'New World Translation of the Holy Scriptures (NWT)'} text and label it as (New World Translation / NWT).`;

    const genderInstruction = body.gender && body.gender !== 'prefer_not_to_say'
      ? `- Sender Gender Context: The sender identifies as ${body.gender}. Ensure greetings, salutations, and tone naturally match this perspective.`
      : "";

    const prompt = `You are a world-class relationship intimacy advisor, empathetic speechwriter, and thoughtful personal gift curator for a relationship reminder app called IsabiLove.

Craft a deeply personalized message and gift suggestions based on the following loved one's profile:
- Recipient Name: ${body.contact.name}
- Relationship Type: ${body.contact.relationship}
- Occasion: ${body.customOccasionTitle || body.occasion}
- Primary Love Language: ${body.contact.loveLanguage || 'Words of Affirmation'}
- Tone Desired: ${body.tone} (Options are: romantic, playful, grateful, poetic, cheerful, pidgin/culturally warm)
- Length preference: ${body.length || 'heartfelt'}
- Preferences: ${prefContext}
- Notes: ${body.contact.importantNotes || 'None'}
- ${memoryContext}
${genderInstruction}

CRITICAL INSTRUCTIONS:
1. Do NOT sound like generic AI corporate prose or cliché greeting card rhyming fluff.
2. Incorporate subtle nods to their love language and personal quirks without sounding mechanical.
3. If tone is 'pidgin', write with authentic, natural Nigerian/West African Pidgin warmth, respect, and celebratory joy.
${religionInstruction}
5. Output MUST be valid JSON adhering strictly to this schema:
{
  "message": "The primary polished message ready to send (1-3 natural paragraphs)",
  "alternative": "A shorter or distinct alternative phrasing (1-2 paragraphs)",
  "suggestedGifts": ["Thoughtful Gift Idea 1 grounded in preferences", "Thoughtful Gift Idea 2", "Experience/Quality Time Idea 3"],
  "deliveryTip": "A 1-sentence tip on best timing or presentation"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.85,
      }
    });

    const rawText = response.text?.trim() || "";
    try {
      const parsed = JSON.parse(rawText);
      return res.json({
        message: parsed.message || "",
        alternative: parsed.alternative || "",
        suggestedGifts: Array.isArray(parsed.suggestedGifts) ? parsed.suggestedGifts : [],
        deliveryTip: parsed.deliveryTip || "Send with love and presence.",
        source: "gemini-3.8-flash"
      });
    } catch {
      // If JSON parsing had stray markdown ticks
      const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return res.json({
        message: parsed.message || "",
        alternative: parsed.alternative || "",
        suggestedGifts: Array.isArray(parsed.suggestedGifts) ? parsed.suggestedGifts : [],
        deliveryTip: parsed.deliveryTip || "Send with love and presence.",
        source: "gemini-3.8-flash"
      });
    }
  } catch (err: any) {
    console.error("Gemini API error, falling back to smart template:", err);
    const fallback = getFallbackMessage(req.body);
    return res.json({
      ...fallback,
      source: "fallback",
      warning: err.message || "Gemini service temporarily unavailable"
    });
  }
}

// In-memory push subscriptions store
const pushSubscriptions = new Map<string, PushSubscriptionData>();

interface PushSubscriptionData {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  userId?: string;
  userAgent?: string;
  subscribedAt: string;
}

export async function handleSubscribePush(req: Request, res: Response) {
  try {
    const { endpoint, keys, userId, userAgent } = req.body;
    if (!endpoint || !keys) {
      return res.status(400).json({ error: 'endpoint and keys are required' });
    }

    pushSubscriptions.set(endpoint, {
      endpoint,
      keys,
      userId,
      userAgent,
      subscribedAt: new Date().toISOString(),
    });

    return res.json({ success: true, subscribed: true, subscribedAt: new Date().toISOString() });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Push subscription failed' });
  }
}

export async function handleUnsubscribePush(req: Request, res: Response) {
  try {
    const { endpoint } = req.body;
    if (!endpoint) {
      return res.status(400).json({ error: 'endpoint is required' });
    }

    pushSubscriptions.delete(endpoint);
    return res.json({ success: true, unsubscribed: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Push unsubscription failed' });
  }
}

export async function handleSendPush(req: Request, res: Response) {
  try {
    const { title, body, icon, tag, url, data } = req.body;
    if (!title || !body) {
      return res.status(400).json({ error: 'title and body are required' });
    }

    const notificationPayload = {
      title,
      body,
      icon: icon || '/src/assets/images/avatar_partner_1792816163693.jpg',
      tag: tag || 'isabilove-notification',
      data: data || {},
      ...(url ? { url } : {}),
    };

    const results = await Promise.allSettled(
      Array.from(pushSubscriptions.values()).map(async (sub) => {
        // In a production environment, you would use the Web Push library
        // to send encrypted push payloads to each subscription endpoint.
        // For now, we simulate dispatch via the existing webhook mechanism
        // or store the notification for later delivery.
        console.log('Would send push to:', sub.endpoint, notificationPayload);
        return { endpoint: sub.endpoint, status: 'simulated' };
      })
    );

    return res.json({
      success: true,
      sent: results.length,
      results,
      dispatchedAt: new Date().toISOString(),
      simulated: true,
      note: 'Push notifications require VAPID keys for production delivery. Currently simulated.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Push send failed' });
  }
}

export async function handleDispatchWebhook(req: Request, res: Response) {
  try {
    const { url, payload } = req.body;
    if (!url) {
      return res.status(400).json({ error: "Webhook URL is required" });
    }

    // If it's a test/mock URL or real URL:
    if (url.startsWith("https://") || url.startsWith("http://")) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "IsabiLove-Reminder-Dispatcher/1.0"
          },
          body: JSON.stringify(payload)
        });
        const respText = await response.text();
        return res.json({
          success: response.ok,
          status: response.status,
          response: respText.slice(0, 500),
          dispatchedAt: new Date().toISOString()
        });
      } catch (networkErr: any) {
        return res.json({
          success: false,
          status: 502,
          error: networkErr.message || "Failed to reach target webhook URL",
          simulated: false,
          dispatchedAt: new Date().toISOString()
        });
      }
    } else {
      return res.json({
        success: true,
        status: 200,
        response: "Simulated webhook delivery acknowledged (test channel)",
        simulated: true,
        dispatchedAt: new Date().toISOString()
      });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Webhook delivery failed" });
  }
}
