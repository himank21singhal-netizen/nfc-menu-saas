import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { items, categories, targetLang } = await req.json();

    if (!targetLang || targetLang === 'en') {
      return NextResponse.json({ success: true, items, categories });
    }

    // Free & reliable AI Translation via MyMemory Translation API
    const translateText = async (text: string, lang: string) => {
      if (!text || !text.trim()) return text;
      try {
        const res = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${lang}`
        );
        const data = await res.json();
        return data.responseData?.translatedText || text;
      } catch (err) {
        return text;
      }
    };

    // Translate categories concurrently
    const translatedCategories = await Promise.all(
      categories.map(async (cat: any) => ({
        ...cat,
        translatedName: await translateText(cat.name, targetLang),
      }))
    );

    // Translate items concurrently
    const translatedItems = await Promise.all(
      items.map(async (item: any) => ({
        ...item,
        translatedName: await translateText(item.name, targetLang),
        translatedDescription: await translateText(item.description, targetLang),
      }))
    );

    return NextResponse.json({
      success: true,
      categories: translatedCategories,
      items: translatedItems,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Translation failed' }, { status: 500 });
  }
}