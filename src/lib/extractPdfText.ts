type PdfRuntime = Awaited<typeof import("pdfjs-dist/build/pdf.mjs")>;

let pdfRuntimePromise: Promise<PdfRuntime> | null = null;

async function loadPdfRuntime() {
  if (!pdfRuntimePromise) {
    pdfRuntimePromise = import("pdfjs-dist/build/pdf.mjs");
  }

  return pdfRuntimePromise;
}

function normalizeTextItems(items: string[]) {
  return items
    .map((item) => item.replace(/\u0000/g, "").trim())
    .filter(Boolean)
    .join(" ");
}

export async function extractPdfText(file: File) {
  return extractPdfTextFromBlob(file);
}

export async function extractPdfTextFromBlob(file: Blob) {
  const pdfRuntime = await loadPdfRuntime();
  const buffer = await file.arrayBuffer();
  const document = await pdfRuntime.getDocument({ data: buffer, disableWorker: true }).promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const items = textContent.items
      .map((item: { str?: string }) => ("str" in item ? item.str ?? "" : ""))
      .filter(Boolean);

    pages.push(normalizeTextItems(items));
  }

  return pages.join("\n\n");
}
