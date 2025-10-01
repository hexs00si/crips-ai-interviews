import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs/promises';
import { parsePDF, parseDOCX, extractName, extractEmail, extractPhone } from '../../src/lib/resumeParser.js';

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false
  }
};

/**
 * API Route: Upload and Parse Resume
 * POST /api/candidate/upload-resume
 *
 * Handles resume file upload, parsing, and field extraction
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  try {
    // Parse the multipart form data
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB max
      keepExtensions: true
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const sessionId = fields.sessionId?.[0] || fields.sessionId;
    const resumeFile = files.resume?.[0] || files.resume;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing sessionId'
      });
    }

    if (!resumeFile) {
      return res.status(400).json({
        success: false,
        error: 'No resume file uploaded'
      });
    }

    // Verify session exists
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({
        success: false,
        error: 'Invalid session ID'
      });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(resumeFile.mimetype)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file type. Only PDF and DOCX files are allowed.'
      });
    }

    // Read file buffer
    const fileBuffer = await fs.readFile(resumeFile.filepath);

    // Upload to Supabase Storage
    const fileName = `${sessionId}/${Date.now()}_${resumeFile.originalFilename}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, fileBuffer, {
        contentType: resumeFile.mimetype,
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Failed to upload resume to storage');
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(fileName);

    const resumeUrl = urlData.publicUrl;

    // Parse resume based on file type
    let parseResult;
    if (resumeFile.mimetype === 'application/pdf') {
      parseResult = await parsePDF({ arrayBuffer: () => Promise.resolve(fileBuffer) });
    } else {
      parseResult = await parseDOCX({ arrayBuffer: () => Promise.resolve(fileBuffer) });
    }

    if (!parseResult.success) {
      throw new Error('Failed to parse resume content');
    }

    const resumeText = parseResult.text;

    // Extract fields from resume text
    const extractedFields = {
      name: extractName(resumeText),
      email: extractEmail(resumeText),
      phone: extractPhone(resumeText)
    };

    // Determine which fields are missing
    const missingFields = [];
    if (!extractedFields.name) missingFields.push('name');
    if (!extractedFields.email) missingFields.push('email');
    if (!extractedFields.phone) missingFields.push('phone');

    // Update session with resume data
    const { data: updatedSession, error: updateError } = await supabase
      .from('interview_sessions')
      .update({
        resume_url: resumeUrl,
        resume_text: resumeText,
        candidate_name: extractedFields.name || session.candidate_name,
        candidate_email: extractedFields.email || session.candidate_email,
        candidate_phone: extractedFields.phone || session.candidate_phone,
        resume_data: {
          filename: resumeFile.originalFilename,
          uploadedAt: new Date().toISOString(),
          extractedFields
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Clean up temporary file
    await fs.unlink(resumeFile.filepath).catch(() => {});

    return res.status(200).json({
      success: true,
      session: updatedSession,
      extractedFields,
      missingFields,
      resumeUrl,
      needsMoreInfo: missingFields.length > 0
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to upload and parse resume',
      details: error.message
    });
  }
}