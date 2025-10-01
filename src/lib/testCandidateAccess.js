/**
 * Test script to debug candidate access code validation
 * Run this in browser console at http://localhost:5174/auth
 *
 * Usage:
 * import { testAccessCode } from '@/lib/testCandidateAccess'
 * testAccessCode('CRISP-7SLX-STTA')
 */

import { supabase } from './supabase';

export async function testAccessCode(accessCode) {
  console.log('🔍 Testing access code:', accessCode);

  const formattedCode = accessCode.toUpperCase().trim();

  // Test 1: Check Supabase connection
  console.log('\n📊 Test 1: Checking Supabase connection...');
  const { data: connectionTest, error: connError } = await supabase
    .from('interviews')
    .select('count')
    .limit(1);

  if (connError) {
    console.error('❌ Connection failed:', connError);
    return { success: false, error: 'Connection failed', details: connError };
  }
  console.log('✅ Connected to Supabase');

  // Test 2: Get all interviews (check RLS)
  console.log('\n📊 Test 2: Fetching all interviews...');
  const { data: allInterviews, error: allError } = await supabase
    .from('interviews')
    .select('id, title, access_code, status, interviewer_id, created_at');

  if (allError) {
    console.error('❌ Failed to fetch interviews:', allError);
    console.log('⚠️  This might be a Row Level Security (RLS) issue');
    return { success: false, error: 'RLS blocking access', details: allError };
  }

  console.log(`✅ Found ${allInterviews?.length || 0} interviews total`);
  console.log('📋 All interviews:', allInterviews);

  // Test 3: Search for specific access code
  console.log(`\n📊 Test 3: Searching for access_code = "${formattedCode}"...`);
  const { data: specificInterview, error: searchError } = await supabase
    .from('interviews')
    .select('*')
    .eq('access_code', formattedCode);

  if (searchError) {
    console.error('❌ Search failed:', searchError);
    return { success: false, error: 'Search failed', details: searchError };
  }

  console.log(`✅ Search completed. Found: ${specificInterview?.length || 0} matches`);
  console.log('📋 Matching interviews:', specificInterview);

  // Test 4: Search with status filter
  console.log(`\n📊 Test 4: Searching with status = "active"...`);
  const { data: activeInterview, error: activeError } = await supabase
    .from('interviews')
    .select('*')
    .eq('access_code', formattedCode)
    .eq('status', 'active');

  if (activeError) {
    console.error('❌ Status filter search failed:', activeError);
    return { success: false, error: 'Status search failed', details: activeError };
  }

  console.log(`✅ Found: ${activeInterview?.length || 0} active interviews`);
  console.log('📋 Active interviews:', activeInterview);

  // Test 5: Try .single()
  if (activeInterview && activeInterview.length > 0) {
    console.log(`\n📊 Test 5: Using .single() to get exact match...`);
    const { data: singleInterview, error: singleError } = await supabase
      .from('interviews')
      .select('*')
      .eq('access_code', formattedCode)
      .eq('status', 'active')
      .single();

    if (singleError) {
      console.error('❌ .single() failed:', singleError);
      return { success: false, error: '.single() failed', details: singleError };
    }

    console.log('✅ Got interview with .single():', singleInterview);
    return { success: true, interview: singleInterview };
  } else {
    console.log('\n⚠️  No active interview found with this access code');
    console.log('💡 Possible reasons:');
    console.log('   1. Access code does not exist in database');
    console.log('   2. Interview status is not "active"');
    console.log('   3. Row Level Security (RLS) is blocking access');
    console.log('   4. Access code has different formatting in database');

    // Check for similar codes
    if (allInterviews && allInterviews.length > 0) {
      console.log('\n🔍 Checking for similar access codes...');
      const similar = allInterviews.filter(i =>
        i.access_code && i.access_code.toLowerCase().includes(formattedCode.toLowerCase().substring(6, 10))
      );
      if (similar.length > 0) {
        console.log('📋 Similar codes found:', similar.map(i => i.access_code));
      }
    }

    return { success: false, error: 'No active interview found' };
  }
}

// Auto-run if in development
if (import.meta.env.DEV) {
  window.testAccessCode = testAccessCode;
  console.log('✅ Test function loaded. Run: testAccessCode("CRISP-XXXX-XXXX")');
}
