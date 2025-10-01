import * as pdfjsLib from 'pdfjs-dist';

/**
 * Browser-Compatible Resume Parser
 * Uses PDF.js for client-side PDF parsing
 */

// Configure PDF.js worker - Use local copy from public directory
// This avoids CDN version mismatch issues
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';

console.log('[resumeParserBrowser] PDF.js worker configured');
console.log('[resumeParserBrowser] Worker URL:', pdfjsLib.GlobalWorkerOptions.workerSrc);
console.log('[resumeParserBrowser] PDF.js version:', pdfjsLib.version);

/**
 * Extract text from PDF file using PDF.js
 */
export async function parsePDF(file) {
  console.log('[resumeParserBrowser] Starting PDF parsing for:', file.name);

  try {
    const arrayBuffer = await file.arrayBuffer();
    console.log('[resumeParserBrowser] File loaded as ArrayBuffer, size:', arrayBuffer.byteLength);

    // Load PDF document
    console.log('[resumeParserBrowser] Loading PDF document...');
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    console.log('[resumeParserBrowser] PDF loaded successfully, pages:', pdf.numPages);

    let fullText = '';

    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      console.log('[resumeParserBrowser] Extracting text from page', pageNum);
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
      console.log('[resumeParserBrowser] Page', pageNum, 'extracted, length:', pageText.length);
    }

    console.log('[resumeParserBrowser] ✓ PDF parsing complete, total text length:', fullText.length);
    console.log('[resumeParserBrowser] Text preview:', fullText.substring(0, 200));

    return {
      success: true,
      text: fullText
    };
  } catch (error) {
    console.error('[resumeParserBrowser] ✗ PDF parsing error:', error);
    console.error('[resumeParserBrowser] Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return {
      success: false,
      error: error.message || 'Failed to parse PDF'
    };
  }
}

/**
 * Extract text from DOCX file
 */
export async function parseDOCX(file) {
  console.warn('[resumeParserBrowser] DOCX parsing not yet implemented');
  return {
    success: false,
    error: 'DOCX parsing not supported yet. Please use PDF format or enter information manually.'
  };
}

/**
 * Extract contact fields from text using regex patterns
 */
export function extractFields(text) {
  console.log('[resumeParserBrowser] Extracting fields from text, length:', text.length);

  const fields = {
    name: null,
    email: null,
    phone: null
  };

  // Extract email (most reliable)
  const emailRegex = /[\w.+-]+@[\w-]+\.[\w.-]+/;
  const emailMatch = text.match(emailRegex);
  if (emailMatch) {
    fields.email = emailMatch[0];
    console.log('[resumeParserBrowser] ✓ Email found:', fields.email);
  } else {
    console.log('[resumeParserBrowser] ✗ Email not found');
  }

  // Extract phone (various formats)
  const phoneRegex = /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/;
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch) {
    fields.phone = phoneMatch[0];
    console.log('[resumeParserBrowser] ✓ Phone found:', fields.phone);
  } else {
    console.log('[resumeParserBrowser] ✗ Phone not found');
  }

  // Extract name (heuristic: first line with 2-4 words, all capitalized or title case)
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  console.log('[resumeParserBrowser] Checking first 5 lines for name...');

  for (const line of lines.slice(0, 5)) {
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 4) {
      // Check if looks like a name (starts with capital letters)
      const looksLikeName = words.every(word =>
        word.length > 0 &&
        word[0] === word[0].toUpperCase() &&
        /^[A-Za-z'-]+$/.test(word)
      );
      if (looksLikeName) {
        fields.name = line;
        console.log('[resumeParserBrowser] ✓ Name found:', fields.name);
        break;
      }
    }
  }

  if (!fields.name) {
    console.log('[resumeParserBrowser] ✗ Name not found');
  }

  console.log('[resumeParserBrowser] Field extraction complete:', fields);
  return fields;
}

/**
 * Main resume parsing function
 */
export async function parseResume(file) {
  console.log('[resumeParserBrowser] ========== RESUME PARSING START ==========');
  console.log('[resumeParserBrowser] File:', file.name, 'Size:', file.size, 'Type:', file.type);

  const fileType = file.name.split('.').pop().toLowerCase();
  console.log('[resumeParserBrowser] Detected file type:', fileType);

  let parseResult;

  if (fileType === 'pdf') {
    parseResult = await parsePDF(file);
  } else if (fileType === 'docx' || fileType === 'doc') {
    parseResult = await parseDOCX(file);
  } else {
    console.error('[resumeParserBrowser] Unsupported file type:', fileType);
    return {
      success: false,
      error: 'Unsupported file format. Please upload PDF or DOCX.'
    };
  }

  if (!parseResult.success) {
    console.error('[resumeParserBrowser] Parsing failed:', parseResult.error);
    return parseResult;
  }

  // Extract fields from text
  const fields = extractFields(parseResult.text);

  const result = {
    success: true,
    text: parseResult.text,
    fields: fields
  };

  console.log('[resumeParserBrowser] ========== RESUME PARSING COMPLETE ==========');
  console.log('[resumeParserBrowser] Final result:', {
    success: result.success,
    textLength: result.text.length,
    fields: result.fields
  });

  return result;
}
