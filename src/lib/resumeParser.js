// NOTE: pdf-parse and mammoth don't work in browser
// Temporarily disabled until we implement browser-compatible solution
// import pdfParse from 'pdf-parse';
// import mammoth from 'mammoth';

/**
 * Resume Parser Utility
 * Extracts text and fields from PDF and DOCX resumes
 *
 * TEMPORARY: Resume upload disabled - pdf-parse is Node.js only
 * TODO: Replace with pdfjs-dist or server-side processing
 */

/**
 * Extract text from PDF file
 * TEMPORARILY DISABLED - pdf-parse doesn't work in browser
 */
export async function parsePDF(file) {
  console.warn('[resumeParser] PDF parsing temporarily disabled');
  return {
    success: false,
    error: 'PDF parsing temporarily unavailable. Please enter information manually.'
  };

  // try {
  //   const arrayBuffer = await file.arrayBuffer();
  //   const buffer = typeof Buffer !== 'undefined'
  //     ? Buffer.from(arrayBuffer)
  //     : new Uint8Array(arrayBuffer);
  //   const data = await pdfParse(buffer);
  //   return {
  //     success: true,
  //     text: data.text,
  //     pages: data.numpages
  //   };
  // } catch (error) {
  //   console.error('PDF parsing error:', error);
  //   return {
  //     success: false,
  //     error: 'Failed to parse PDF file'
  //   };
  // }
}

/**
 * Extract text from DOCX file
 * TEMPORARILY DISABLED - mammoth has issues in browser
 */
export async function parseDOCX(file) {
  console.warn('[resumeParser] DOCX parsing temporarily disabled');
  return {
    success: false,
    error: 'DOCX parsing temporarily unavailable. Please enter information manually.'
  };

  // try {
  //   const arrayBuffer = await file.arrayBuffer();
  //   const result = await mammoth.extractRawText({ arrayBuffer });
  //   return {
  //     success: true,
  //     text: result.value,
  //     messages: result.messages
  //   };
  // } catch (error) {
  //   console.error('DOCX parsing error:', error);
  //   return {
  //     success: false,
  //     error: 'Failed to parse DOCX file'
  //   };
  // }
}

/**
 * Extract name from resume text
 * Heuristic: Usually the first line or first few words
 */
export function extractName(text) {
  if (!text) return null;

  // Remove extra whitespace and split into lines
  const lines = text
    .replace(/\s+/g, ' ')
    .trim()
    .split('\n')
    .filter((line) => line.trim().length > 0);

  if (lines.length === 0) return null;

  // First line is often the name
  const firstLine = lines[0].trim();

  // Name should be 2-4 words, not too long
  const words = firstLine.split(' ').filter((w) => w.length > 0);
  if (words.length >= 2 && words.length <= 4 && firstLine.length < 50) {
    return firstLine;
  }

  // Try second line
  if (lines.length > 1) {
    const secondLine = lines[1].trim();
    const words2 = secondLine.split(' ').filter((w) => w.length > 0);
    if (words2.length >= 2 && words2.length <= 4 && secondLine.length < 50) {
      return secondLine;
    }
  }

  return null;
}

/**
 * Extract email from resume text
 */
export function extractEmail(text) {
  if (!text) return null;

  // Email regex pattern
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const matches = text.match(emailRegex);

  if (matches && matches.length > 0) {
    // Return first email found
    return matches[0].toLowerCase();
  }

  return null;
}

/**
 * Extract phone number from resume text
 */
export function extractPhone(text) {
  if (!text) return null;

  // Multiple phone patterns
  const patterns = [
    // +1-234-567-8900, +1 234 567 8900
    /\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    // (234) 567-8900
    /\(\d{3}\)\s*\d{3}[-.\s]?\d{4}/g,
    // 234-567-8900
    /\d{3}[-.\s]\d{3}[-.\s]\d{4}/g,
    // 234.567.8900
    /\d{3}\.\d{3}\.\d{4}/g,
    // 2345678900
    /\b\d{10}\b/g
  ];

  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      // Clean and format the phone number
      return matches[0].trim();
    }
  }

  return null;
}

/**
 * Main function to extract all fields from resume
 */
export function extractFields(text) {
  return {
    name: extractName(text),
    email: extractEmail(text),
    phone: extractPhone(text)
  };
}

/**
 * Determine which fields are missing
 */
export function getMissingFields(extractedFields) {
  const missing = [];

  if (!extractedFields.name || extractedFields.name.trim() === '') {
    missing.push('name');
  }

  if (!extractedFields.email || extractedFields.email.trim() === '') {
    missing.push('email');
  }

  if (!extractedFields.phone || extractedFields.phone.trim() === '') {
    missing.push('phone');
  }

  return missing;
}

/**
 * Validate extracted fields
 */
export function validateFields(fields) {
  const errors = {};

  // Validate name
  if (fields.name) {
    if (fields.name.length < 2) {
      errors.name = 'Name is too short';
    } else if (fields.name.length > 100) {
      errors.name = 'Name is too long';
    }
  }

  // Validate email
  if (fields.email) {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;
    if (!emailRegex.test(fields.email)) {
      errors.email = 'Invalid email format';
    }
  }

  // Validate phone
  if (fields.phone) {
    // Remove all non-digit characters
    const digits = fields.phone.replace(/\D/g, '');
    if (digits.length < 10) {
      errors.phone = 'Phone number is too short';
    } else if (digits.length > 15) {
      errors.phone = 'Phone number is too long';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Format phone number to consistent format
 */
export function formatPhoneNumber(phone) {
  if (!phone) return null;

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Format based on length
  if (digits.length === 10) {
    // US format: (234) 567-8900
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 11 && digits[0] === '1') {
    // US with country code: +1 (234) 567-8900
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  } else {
    // International or other format: keep as-is with spaces
    return digits.replace(/(\d{3})/g, '$1 ').trim();
  }
}

/**
 * Parse resume file and extract fields
 * Main entry point
 */
export async function parseResume(file) {
  if (!file) {
    return {
      success: false,
      error: 'No file provided'
    };
  }

  // Check file type
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  let parseResult;

  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    parseResult = await parsePDF(file);
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    parseResult = await parseDOCX(file);
  } else {
    return {
      success: false,
      error: 'Unsupported file type. Please upload PDF or DOCX.'
    };
  }

  if (!parseResult.success) {
    return parseResult;
  }

  // Extract fields from text
  const extractedFields = extractFields(parseResult.text);
  const missingFields = getMissingFields(extractedFields);
  const validation = validateFields(extractedFields);

  // Format phone number if present
  if (extractedFields.phone) {
    extractedFields.phone = formatPhoneNumber(extractedFields.phone);
  }

  return {
    success: true,
    text: parseResult.text,
    fields: extractedFields,
    missingFields,
    validation,
    requiresChatbot: missingFields.length > 0
  };
}