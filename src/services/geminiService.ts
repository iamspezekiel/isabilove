import { Contact, ToneType, ReligionType, GenderType } from '../types';

export interface GenerateMessageOptions {
  contact: Contact;
  occasion: string;
  customOccasionTitle?: string;
  tone: ToneType;
  length?: 'short' | 'standard' | 'heartfelt';
  religion?: ReligionType;
  gender?: GenderType;
  scriptureTranslation?: string;
}

export interface GeneratedMessageResult {
  message: string;
  alternative: string;
  suggestedGifts: string[];
  deliveryTip: string;
  source?: string;
}

export async function generateAiMessage(options: GenerateMessageOptions): Promise<GeneratedMessageResult> {
  try {
    const response = await fetch('/api/gemini/generate-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contact: {
          name: options.contact.name,
          relationship: options.contact.relationship,
          loveLanguage: options.contact.loveLanguage,
          preferences: options.contact.preferences,
          memories: options.contact.memories,
          importantNotes: options.contact.importantNotes,
        },
        occasion: options.occasion,
        customOccasionTitle: options.customOccasionTitle,
        tone: options.tone,
        length: options.length || 'heartfelt',
        religion: options.religion,
        gender: options.gender,
        scriptureTranslation: options.scriptureTranslation,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      message: data.message || '',
      alternative: data.alternative || '',
      suggestedGifts: Array.isArray(data.suggestedGifts) ? data.suggestedGifts : [],
      deliveryTip: data.deliveryTip || 'Send with genuine warmth and care.',
      source: data.source || 'gemini',
    };
  } catch (error) {
    console.warn('API error during Gemini generation, falling back to local client generator:', error);
    return getLocalFallback(options);
  }
}

function getLocalFallback(options: GenerateMessageOptions): GeneratedMessageResult {
  const { contact, occasion, tone, religion } = options;
  const name = contact.name || 'my love';
  const occTitle = options.customOccasionTitle || occasion.replace('_', ' ');

  let message = `Happy ${occTitle}, ${name}! You bring so much light and meaning into my life. Every day with you is a gift, and today I'm taking a moment to celebrate everything that makes you so special.`;
  let alternative = `Thinking about you on this special ${occTitle}, ${name}. Thank you for always being your wonderful self. Sending you the warmest hug and deepest love today!`;

  if (religion === 'muslim') {
    if (tone === 'grateful') {
      message = `Dearest ${name}, on this ${occTitle}, I pray that Allah blesses you with abundant peace, good health, and barakah. You are a true blessing in my life, and I thank Allah for your noble presence and steadfast kindness.`;
      alternative = `Assalamu Alaikum and happy ${occTitle}, ${name}. May Allah shower your days with mercy and reward you generously for all the goodness you bring to our family.`;
    } else if (tone === 'romantic') {
      message = `Happy ${occTitle}, my beloved ${name}. May Allah always preserve the tranquility, love, and mercy between our hearts. With each passing day, I thank Allah for blessing me with your devotion and gentle spirit.`;
      alternative = `To the love of my life on our ${occTitle}: May Allah protect our home and grant us peace in this life and the next. You are my greatest joy, ${name}.`;
    } else if (tone === 'playful') {
      message = `Happy ${occTitle}, ${name}! Look at you, gracefully tolerating me for another year! Life would be so dull without your laughter. May Allah keep you smiling always!`;
      alternative = `Alert: Today is officially ${name} Appreciation Day! Happy ${occTitle}! I promise to let you pick the snacks today. Cheers to my favorite human!`;
    } else if (tone === 'poetic') {
      message = `For ${name}, on this ${occTitle}: Like a cool breeze at dusk, your presence brings tranquility to every room you enter. May Allah bless your path with light and fill your days with peace.`;
      alternative = `Shared smiles, quiet prayers, and unspoken trust—these are our sweetest havens. Happy ${occTitle}, ${name}. May Allah grant you joy at every turn.`;
    } else if (tone === 'pidgin') {
      message = `My person! Happy ${occTitle}, ${name}! As Allah dey bless you, no sorrow go near you at all o. Chop life well well today, you get special place for my heart!`;
      alternative = `Abeg clear road for ${name} today! Happy ${occTitle}! May Allah continue to guide and protect you always. I dey solid for your back!`;
    }
  } else if (religion === 'none') {
    if (tone === 'grateful') {
      message = `Dearest ${name}, on this ${occTitle}, I simply wanted to express how deeply thankful I am for your presence in my life. You have consistently stood by me with unwavering support, honesty, and kindness. You are a true treasure.`;
      alternative = `Happy ${occTitle}, ${name}. Life has its ups and downs, but having someone as grounding, dependable, and loving as you makes all the difference. Thank you for everything you do.`;
    } else if (tone === 'romantic') {
      message = `Happy ${occTitle}, my darling ${name}. You hold my whole heart, and with each passing season I fall deeper in love with your kindness, your laughter, and the warmth you bring into my world. Thank you for being my anchor.`;
      alternative = `To the love of my life on our ${occTitle}: every quiet moment, every shared laugh, and every step with you is my greatest gift. I love you more than words could ever convey, ${name}.`;
    } else if (tone === 'playful') {
      message = `Happy ${occTitle}, ${name}! Look at you, gracefully tolerating me for another year. Life would be immensely boring without your chaotic energy and contagious laugh. Let's celebrate properly today!`;
      alternative = `Alert: Today is officially ${name} Appreciation Day! Happy ${occTitle}! I promise to let you pick the snacks and have the final say on the playlist today. Cheers to my favorite human!`;
    } else if (tone === 'poetic') {
      message = `For ${name}, on this ${occTitle}: Some people walk into a room and the light changes. That has always been you for me. Today we celebrate the beauty and depth you weave into ordinary days. May your year ahead be luminous.`;
      alternative = `Quiet mornings, shared stories, and the unspoken understanding between us—these are my favorite havens. Happy ${occTitle}, ${name}. May happiness find you at every turn.`;
    } else if (tone === 'pidgin') {
      message = `My person! Happy ${occTitle}, ${name}! No be small thing to get someone like you for this life o. As today na your special day, chop life well well and know say you get special place for my heart always!`;
      alternative = `Abeg make everybody clear road for ${name} today! Happy ${occTitle}! Your joy and sweet energy dey always bring peace. Enjoy your day to the fullest, I dey solid for your back anytime!`;
    }
  } else {
    // Christianity default
    if (tone === 'romantic') {
      message = `Happy ${occTitle}, my darling ${name}. You hold my whole heart, and with each passing season I fall deeper in love with your kindness, your laughter, and the warmth you bring into my world. Thank you for being my home.`;
      alternative = `To the love of my life on our ${occTitle}: every quiet moment, every laugh, and every step with you is my greatest blessing. I love you more than words can say.`;
    } else if (tone === 'playful') {
      message = `Happy ${occTitle}, ${name}! Look at you, gracefully tolerating me for another year. In all seriousness, life would be immensely boring without your chaotic energy and contagious laugh. Let's celebrate properly today!`;
      alternative = `Alert: Today is officially ${name} Appreciation Day! Happy ${occTitle}! I promise to let you pick the snacks and choose the playlist today. Cheers to my favorite human!`;
    } else if (tone === 'grateful') {
      message = `Dearest ${name}, on this ${occTitle}, I simply wanted to express how deeply thankful I am for your presence in my life. You have consistently stood by me with unwavering support and patience. You are a true treasure.`;
      alternative = `Happy ${occTitle}, ${name}. Life has its ups and downs, but having someone as grounding, dependable, and loving as you makes all the difference. Thank you for everything you do.`;
    } else if (tone === 'poetic') {
      message = `For ${name}, on this ${occTitle}: Some people walk into a room and the light changes. That has always been you for me. Today we celebrate the beauty and depth you weave into ordinary days. May your year ahead be as luminous as your soul.`;
      alternative = `Quiet mornings, shared stories, and the unspoken understanding between us—these are my favorite havens. Happy ${occTitle}, ${name}. May happiness find you at every turn.`;
    } else if (tone === 'pidgin') {
      message = `My person! Happy ${occTitle}, ${name}! No be small thing to get someone like you for this life o. As today na your special day, chop life well well and know say you get special place for my heart always!`;
      alternative = `Abeg make everybody clear road for ${name} today! Happy ${occTitle}! Your joy and sweet energy dey always bring peace. Enjoy your day to the fullest, I dey solid for your back anytime!`;
    }
  }

  const gifts: string[] = [];
  if (contact.preferences?.favoriteFlowers) {
    gifts.push(`Fresh bouquet of ${contact.preferences.favoriteFlowers}`);
  } else {
    gifts.push('A hand-tied seasonal bouquet with a personalized wax-sealed card');
  }

  if (contact.preferences?.favoriteTreats) {
    gifts.push(`Curated gift basket with their favorite treat: ${contact.preferences.favoriteTreats}`);
  } else {
    gifts.push('An artisanal pastry and gourmet tea selection');
  }

  if (contact.loveLanguage === 'quality_time') {
    gifts.push('An intimate sunset dinner or picnic date at a scenic viewpoint');
  } else if (contact.loveLanguage === 'acts_of_service') {
    gifts.push('Take over their most stressful chores for the upcoming week');
  } else {
    gifts.push('A customized memory photo frame commemorating a favorite trip together');
  }

  return {
    message,
    alternative,
    suggestedGifts: gifts,
    deliveryTip: 'Best delivered early in the day with their favorite beverage.',
    source: 'offline-template',
  };
}

export async function dispatchExternalWebhook(url: string, payload: any) {
  const response = await fetch('/api/notifications/dispatch-webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, payload }),
  });
  return response.json();
}
