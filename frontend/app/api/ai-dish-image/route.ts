import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { dishName, tier } = await req.json();

    if (!dishName) {
      return NextResponse.json({ error: 'Dish name is required.' }, { status: 400 });
    }

    // Clean up query terms for clean food photo matching
    const query = encodeURIComponent(`${dishName} food dish`);
    
    // Primary culinary image generator endpoint via Unsplash Source API
    const generatedImageUrl = `https://source.unsplash.com/featured/800x600/?${query}`;

    return NextResponse.json({ 
      success: true, 
      imageUrl: generatedImageUrl 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to generate AI dish image.' }, { status: 500 });
  }
}