import { PDFDocument } from "pdf-lib";

interface CreatePngPdfParams {
  pngBuffer: Buffer;
  widthInches: number;
  heightInches: number;
  title: string;
}

export async function createPngPdf(
  params: CreatePngPdfParams,
): Promise<Buffer> {
  const pdfDocument = await PDFDocument.create();
  const page = pdfDocument.addPage([
    params.widthInches * 72,
    params.heightInches * 72,
  ]);

  const pngImage = await pdfDocument.embedPng(params.pngBuffer);

  page.drawImage(pngImage, {
    x: 0,
    y: 0,
    width: params.widthInches * 72,
    height: params.heightInches * 72,
  });

  pdfDocument.setTitle(params.title);
  pdfDocument.setProducer("r6 dynamic-qr-api");
  pdfDocument.setCreator("r6 dynamic-qr-api");

  const bytes = await pdfDocument.save();
  return Buffer.from(bytes);
}
