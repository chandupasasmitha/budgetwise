
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request: Request) {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        return NextResponse.json({ success: false, error: "Cloudinary credentials are not set." }, { status: 500 });
    }
  
  const { image } = await request.json();

  if (!image) {
    return NextResponse.json({ success: false, error: "No image provided" }, { status: 400 });
  }

  try {
    const result = await cloudinary.uploader.upload(image, {
      folder: "budgetwise-receipts",
    });
    return NextResponse.json({ success: true, url: result.secure_url });
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    return NextResponse.json({ success: false, error: "Image upload failed." }, { status: 500 });
  }
}
