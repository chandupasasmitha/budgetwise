
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

function getPublicIdFromUrl(url: string): string | null {
    try {
        const urlParts = url.split('/');
        const versionIndex = urlParts.findIndex(part => part.startsWith('v') && !isNaN(Number(part.substring(1))));
        if (versionIndex === -1 || versionIndex + 1 >= urlParts.length) {
            return null;
        }
        // The public ID is everything after the version number, with the extension removed.
        const publicIdWithFolderAndExtension = urlParts.slice(versionIndex + 1).join('/');
        const lastDotIndex = publicIdWithFolderAndExtension.lastIndexOf('.');
        if (lastDotIndex === -1) {
            return publicIdWithFolderAndExtension;
        }
        return publicIdWithFolderAndExtension.substring(0, lastDotIndex);
    } catch (e) {
        console.error("Error extracting public ID:", e);
        return null;
    }
}


export async function POST(request: Request) {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.error("Cloudinary credentials are not set on the server.");
        return NextResponse.json({ success: false, error: "Image deletion service is not configured. Please contact the administrator." }, { status: 500 });
    }

    const { imageUrl } = await request.json();

    if (!imageUrl) {
        return NextResponse.json({ success: false, error: "No image URL provided" }, { status: 400 });
    }
    
    const publicId = getPublicIdFromUrl(imageUrl);

    if (!publicId) {
        return NextResponse.json({ success: false, error: "Could not extract public ID from URL" }, { status: 400 });
    }

    try {
        const result = await cloudinary.uploader.destroy(publicId);
        if (result.result === 'ok' || result.result === 'not found') {
            return NextResponse.json({ success: true });
        } else {
            throw new Error(result.result);
        }
    } catch (error) {
        console.error("Cloudinary Deletion Error:", error);
        return NextResponse.json({ success: false, error: "Image deletion failed." }, { status: 500 });
    }
}
