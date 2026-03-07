import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { v2 as cloudinary } from "cloudinary";
import { headers } from "next/headers";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// max size of logo image. can be increased on user demand
const MAX_LOGO_BYTES = 2 * 1024 * 1024;

export async function POST(req) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json(
        { message: "You must be logged in to submit a startup." },
        { status: 401 }
      );
    }
    const userId = session.user.id;

    // NOTE: maybe this hard work can be optimized
    const formData = await req.formData();

    const name             = formData.get("name")?.trim();
    const url              = formData.get("url")?.trim();
    const productType      = formData.get("productType")?.trim();
    const category         = formData.get("category")?.trim();
    const description      = formData.get("description")?.trim();
    const forSale          = formData.get("forSale") === "true";
    const seekingCofounder = formData.get("seekingCofounder") === "true";
    const askingPrice      = forSale ? formData.get("askingPrice")?.trim() : null;
    const logoFile         = formData.get("logo");

    let subscriptions = [];
    try {
      const raw = formData.get("subscriptions");
      if (raw) subscriptions = JSON.parse(raw);
    } catch {
      subscriptions = [];
    }

    let techStack = [];
    try {
      const raw = formData.get("techStack");
      if (raw) techStack = JSON.parse(raw);
    } catch {
      techStack = [];
    }

    if (!name || !url || !productType || !category || !description) {
      return NextResponse.json(
        { message: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    if (forSale && !askingPrice) {
      return NextResponse.json(
        { message: "Please provide an asking price for the sale listing." },
        { status: 400 }
      );
    }


    if (forSale && seekingCofounder) {
      return NextResponse.json(
        { message: "A startup cannot be listed for sale while seeking a co-founder." },
        { status: 400 }
      );
    }

    let logoUrl = null;
    let logoPublicId = null;

    if (logoFile && typeof logoFile === "object" && logoFile.size > 0) {
      if (logoFile.size > MAX_LOGO_BYTES) {
        return NextResponse.json(
          { message: "Logo must be under 2MB." },
          { status: 400 }
        );
      }

      const arrayBuffer = await logoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString("base64");
      const mimeType = logoFile.type || "image/png";
      const dataUri = `data:${mimeType};base64,${base64}`;

      const uploadResult = await cloudinary.uploader.upload(dataUri, {
        folder: "bd-saas-zone/logos",
        transformation: [{ width: 400, height: 400, crop: "limit" }],
        resource_type: "image",
      });

      logoUrl = uploadResult.secure_url;
      logoPublicId = uploadResult.public_id;
    }


    const client = await clientPromise;
    const db = client.db(process.env.DB);
    const collection = db.collection("startups");

    const doc = {
      userId,
      name,
      url,
      productType,
      category,
      description,
      logoUrl,
      logoPublicId,
      subscriptions,
      techStack,  
      forSale,
      askingPrice: forSale ? askingPrice : null,
      seekingCofounder,  
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(doc);

    return NextResponse.json(
      { message: "Startup submitted successfully!", id: result.insertedId },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/startups/new]", err);
    return NextResponse.json(
      { message: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}