/**
 * Health Check API Endpoint
 * GET /api/health
 *
 * Returns environment configuration status
 * Helps debug Vercel deployment issues
 */
export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  // Check environment variables (both prefixed and non-prefixed)
  const envCheck = {
    supabase_url: !!(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL),
    supabase_anon_key: !!(process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY),
    gemini_api_key: !!(process.env.GOOGLE_GEMINI_API_KEY || process.env.VITE_GOOGLE_GEMINI_API_KEY)
  };

  // Check which variables are available
  const availableEnvVars = Object.keys(process.env).filter(key =>
    key.includes('SUPABASE') || key.includes('GEMINI') || key.includes('GOOGLE')
  );

  const allConfigured = Object.values(envCheck).every(v => v === true);

  return res.status(200).json({
    success: true,
    status: allConfigured ? 'healthy' : 'unhealthy',
    environment: process.env.NODE_ENV || 'development',
    vercel: process.env.VERCEL === '1',
    timestamp: new Date().toISOString(),
    configuration: envCheck,
    available_env_vars: availableEnvVars,
    message: allConfigured
      ? 'All required environment variables are configured'
      : 'Some environment variables are missing. Check Vercel dashboard.'
  });
}
