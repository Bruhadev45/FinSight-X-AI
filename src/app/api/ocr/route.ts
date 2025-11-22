import { NextRequest, NextResponse } from "next/server";

// Maximum file size: 100MB (browser memory limitation)
const MAX_FILE_SIZE = 100 * 1024 * 1024;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          error: `File too large. Maximum size is 100MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB` 
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    let extractedText = "";

    // Handle PDF files
    if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
      try {
        // Dynamically import pdf-parse for ESM compatibility
        const pdfParse = await import("pdf-parse");

        // Extract text directly from PDF
        const pdfData = await (pdfParse as any)(buffer);
        extractedText = pdfData.text || "";

        // If extracted text is too short, return what we have
        if (extractedText.trim().length < 50) {
          console.log("PDF has minimal text content");
          extractedText = extractedText || "No text content found in PDF. This may be an image-based PDF.";
        }
      } catch (pdfError) {
        console.error("PDF parsing error:", pdfError);
        // Return a helpful message for image-based PDFs
        extractedText = "Unable to extract text from PDF. This may be an image-based or scanned PDF.";
      }
    } 
    // Handle image files (PNG, JPG, etc.) - Return helpful message
    else if (fileType.startsWith("image/")) {
      extractedText = "Image file detected. For best results, please convert images to PDF or text format before uploading.";
    }
    // Handle text-based files
    else if (fileType === "text/plain" || fileType === "text/csv") {
      extractedText = buffer.toString("utf-8");
    }
    // Handle Excel files
    else if (
      fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      fileName.endsWith(".xlsx")
    ) {
      // For XLSX, we'll try to read as text
      try {
        extractedText = buffer.toString("utf-8");
      } catch {
        extractedText = "Excel file detected. Please convert to CSV for better text extraction.";
      }
    }
    else {
      // Default: try to read as text
      try {
        extractedText = buffer.toString("utf-8");
      } catch {
        extractedText = "Unable to extract text from this file type.";
      }
    }

    // Clean up the extracted text
    extractedText = extractedText
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .replace(/\n+/g, "\n") // Replace multiple newlines with single newline
      .trim();

    return NextResponse.json({
      success: true,
      text: extractedText,
      length: extractedText.length,
      fileName: file.name,
      fileType: file.type,
    });
  } catch (error) {
    console.error("OCR error:", error);
    return NextResponse.json(
      {
        error: "Failed to process document",
        details: (error as Error).message
      },
      { status: 500 }
    );
  }
}