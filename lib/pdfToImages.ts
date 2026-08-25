'use client';

import type { PageImage } from './types';

// pdfjs-dist is loaded dynamically on the client only, since it depends on
// browser APIs (Canvas, Worker) that don't exist during the Next.js server build.
async function getPdfJs() {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url
  ).toString();
  return pdfjsLib;
}

const MAX_DIMENSION = 1600; // keep images reasonably sized for the vision API

export interface RenderOptions {
  enhanceContrast?: boolean;
}

export async function fileToPageImages(
  file: File,
  options: RenderOptions = {}
): Promise<PageImage[]> {
  if (file.type === 'application/pdf') {
    return pdfToPageImages(file, options);
  }
  if (file.type.startsWith('image/')) {
    const img = await imageFileToPageImage(file, options);
    return [img];
  }
  throw new Error(`Unsupported file type: ${file.type || 'unknown'}. Please upload a PDF or image.`);
}

async function pdfToPageImages(
  file: File,
  options: RenderOptions = {}
): Promise<PageImage[]> {
  const pdfjsLib = await getPdfJs();
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pages: PageImage[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = Math.min(MAX_DIMENSION / baseViewport.width, MAX_DIMENSION / baseViewport.height, 2.5);
    const viewport = page.getViewport({ scale: Math.max(scale, 1) });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    await page.render({ canvasContext: ctx, viewport }).promise;

    if (options.enhanceContrast) {
      applyContrastEnhancement(ctx, canvas.width, canvas.height);
    }

    pages.push({
      pageIndex: pageNum - 1,
      dataUrl: canvas.toDataURL('image/jpeg', 0.92),
      width: canvas.width,
      height: canvas.height
    });
  }

  return pages;
}

async function imageFileToPageImage(
  file: File,
  options: RenderOptions = {}
): Promise<PageImage> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });

  const dims = await new Promise<{ width: number; height: number }>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error('Failed to load image for sizing'));
    img.src = dataUrl;
  });

  const scale = Math.min(1, MAX_DIMENSION / dims.width, MAX_DIMENSION / dims.height);
  const newWidth = Math.round(dims.width * scale);
  const newHeight = Math.round(dims.height * scale);

  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load image for downscaling'));
    img.src = dataUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = newWidth;
  canvas.height = newHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  ctx.drawImage(img, 0, 0, newWidth, newHeight);

  if (options.enhanceContrast) {
    applyContrastEnhancement(ctx, newWidth, newHeight);
  }

  return {
    pageIndex: 0,
    dataUrl: canvas.toDataURL('image/jpeg', 0.92),
    width: newWidth,
    height: newHeight
  };
}

/**
 * Enhances handwriting contrast by boosting dark pixels and normalizing paper white background.
 */
function applyContrastEnhancement(ctx: CanvasRenderingContext2D, width: number, height: number) {
  try {
    const imgData = ctx.getImageData(0, 0, width, height);
    const d = imgData.data;
    const factor = 1.25; // contrast multiplier
    const intercept = 128 * (1 - factor);

    for (let i = 0; i < d.length; i += 4) {
      d[i] = Math.min(255, Math.max(0, d[i] * factor + intercept)); // R
      d[i + 1] = Math.min(255, Math.max(0, d[i + 1] * factor + intercept)); // G
      d[i + 2] = Math.min(255, Math.max(0, d[i + 2] * factor + intercept)); // B
    }
    ctx.putImageData(imgData, 0, 0);
  } catch (e) {
    console.warn('Contrast enhancement skipped:', e);
  }
}
