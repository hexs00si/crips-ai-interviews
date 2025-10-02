import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GridBackground } from '@/components/ui/aceternity/grid-background';
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams';
import { ResumeUploadModal } from '../components/ResumeUploadModal';
import { MissingFieldsChatbot } from '../components/MissingFieldsChatbot';
import { CheckCircle, User, Mail, Phone, ArrowRight } from 'lucide-react';
import useCandidateStore from '@/stores/candidateStore';
import { candidateInterviewData } from '@/data/candidateInterview';
import { CandidateService } from '@/lib/candidateService';

export function CandidateInfoPage() {
  const navigate = useNavigate();
  const { session, interview, updateCandidateInfo } = useCandidateStore();
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [extractedFields, setExtractedFields] = useState({});
  const [missingFields, setMissingFields] = useState([]);
  const [showChatbot, setShowChatbot] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const { extractedFields: fieldsData } = candidateInterviewData;

  // Wait for Zustand to rehydrate from localStorage, then check session
  useEffect(() => {
    // Small delay to ensure Zustand persist middleware has rehydrated
    const timer = setTimeout(() => {
      console.log('[CandidateInfoPage] ========== INITIALIZATION ==========');
      console.log('[CandidateInfoPage] Checking session after rehydration');
      console.log('[CandidateInfoPage] Session:', session);
      console.log('[CandidateInfoPage] Interview:', interview);

      // If no session after rehydration, redirect to login
      if (!session || !interview) {
        console.error('[CandidateInfoPage] ✗ No session found - redirecting to login');
        navigate('/candidate', { replace: true });
        return;
      }

      // Check session status and redirect appropriately
      console.log('[CandidateInfoPage] Session status:', session.status);

      if (session.status === 'completed') {
        console.log('[CandidateInfoPage] → Interview completed, redirecting to results');
        navigate('/candidate/results', { replace: true });
        return;
      }

      if (session.status === 'in_progress') {
        console.log('[CandidateInfoPage] → Interview in progress, redirecting to interview');
        navigate('/candidate/interview', { replace: true });
        return;
      }

      // Check if candidate info already exists
      if (session.candidate_name && session.candidate_email && session.candidate_phone) {
        console.log('[CandidateInfoPage] ✓ Info complete - showing summary');
        console.log('[CandidateInfoPage] Existing info:', {
          name: session.candidate_name,
          email: session.candidate_email,
          phone: session.candidate_phone
        });
        setExtractedFields({
          name: session.candidate_name,
          email: session.candidate_email,
          phone: session.candidate_phone
        });
        setIsReady(true);
        setShowResumeModal(false);
      } else {
        console.log('[CandidateInfoPage] ✓ No info - showing modal');
        setShowResumeModal(true);
      }

      setIsInitialized(true);
      console.log('[CandidateInfoPage] Initialization complete');
    }, 100); // 100ms delay for Zustand rehydration

    return () => clearTimeout(timer);
  }, []); // Only run once on mount

  const handleResumeUpload = async (file) => {
    console.log('[CandidateInfoPage] ========== RESUME UPLOAD START ==========');
    console.log('[CandidateInfoPage] File:', file.name, 'Size:', file.size);

    try {
      const result = await CandidateService.processAndSaveResume(file, session.id);

      if (!result.success) {
        console.error('[CandidateInfoPage] ✗ Resume upload failed:', result.error);
        return {
          success: false,
          error: result.error || 'Failed to process resume'
        };
      }

      console.log('[CandidateInfoPage] ✓ Resume processed successfully');
      console.log('[CandidateInfoPage] Extracted fields:', result.extractedFields);
      console.log('[CandidateInfoPage] Missing fields:', result.missingFields);

      await updateCandidateInfo({
        candidate_name: result.extractedFields.name,
        candidate_email: result.extractedFields.email,
        candidate_phone: result.extractedFields.phone
      });

      setExtractedFields(result.extractedFields);
      setMissingFields(result.missingFields);
      setShowResumeModal(false);

      if (result.missingFields.length === 0) {
        console.log('[CandidateInfoPage] ✓ All fields extracted - showing summary');
        setIsReady(true);
      } else {
        console.log('[CandidateInfoPage] → Showing chatbot for missing fields:', result.missingFields);
        setShowChatbot(true);
      }

      console.log('[CandidateInfoPage] ========== RESUME UPLOAD COMPLETE ==========');
      return { success: true };
    } catch (error) {
      console.error('[CandidateInfoPage] ✗ Upload error:', error);
      return {
        success: false,
        error: 'Failed to upload resume'
      };
    }
  };

  const handleSkipResume = () => {
    console.log('[CandidateInfoPage] ========== SKIP BUTTON CLICKED ==========');
    console.log('[CandidateInfoPage] Current state BEFORE skip:', {
      showResumeModal,
      showChatbot,
      isReady,
      missingFields,
      extractedFields
    });

    setShowResumeModal(false);
    setMissingFields(['name', 'email', 'phone']);
    setShowChatbot(true);

    console.log('[CandidateInfoPage] State AFTER skip should be:', {
      showResumeModal: false,
      showChatbot: true,
      isReady: false,
      missingFields: ['name', 'email', 'phone'],
      extractedFields: {}
    });
    console.log('[CandidateInfoPage] ========================================');
  };

  const handleChatbotComplete = async (collectedInfo) => {
    try {
      console.log('[CandidateInfoPage] Saving info:', collectedInfo);

      const result = await CandidateService.saveCandidateInfo(session.id, collectedInfo);

      if (!result.success) {
        throw new Error(result.error || 'Failed to save');
      }

      await updateCandidateInfo({
        candidate_name: collectedInfo.name,
        candidate_email: collectedInfo.email,
        candidate_phone: collectedInfo.phone
      });

      setExtractedFields(collectedInfo);
      setShowChatbot(false);
      setIsReady(true);
    } catch (error) {
      console.error('[CandidateInfoPage] Save error:', error);
      alert('Failed to save information. Please try again.');
    }
  };

  const handleContinue = () => {
    navigate('/candidate/interview');
  };

  // Show loading while waiting for Zustand rehydration
  if (!isInitialized) {
    console.log('[CandidateInfoPage] Rendering: Loading state');
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading your session...</p>
        </div>
      </div>
    );
  }

  // Log render decision
  console.log('[CandidateInfoPage] ========== RENDER DECISION ==========');
  console.log('[CandidateInfoPage] Current state:', {
    showResumeModal,
    showChatbot,
    isReady
  });
  console.log('[CandidateInfoPage] Will render:');
  console.log('[CandidateInfoPage]   - Resume Modal?', showResumeModal);
  console.log('[CandidateInfoPage]   - Chatbot?', showChatbot);
  console.log('[CandidateInfoPage]   - Summary?', isReady && !showChatbot);
  console.log('[CandidateInfoPage] ===================================');

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      <GridBackground className="absolute inset-0">
        <BackgroundBeams />
      </GridBackground>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-2xl">
          {showChatbot && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <MissingFieldsChatbot
                missingFields={missingFields}
                extractedFields={extractedFields}
                onComplete={handleChatbotComplete}
              />
            </motion.div>
          )}

          {isReady && !showChatbot && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl shadow-2xl p-8"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {fieldsData.title}
                </h2>
                <p className="text-gray-600">
                  {fieldsData.allFieldsComplete}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">{fieldsData.fields.name.label}</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {extractedFields.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">{fieldsData.fields.email.label}</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {extractedFields.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">{fieldsData.fields.phone.label}</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {extractedFields.phone}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-8 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                <p className="text-sm text-blue-700">
                  <span className="font-semibold">Interview:</span> {interview?.title || 'Not specified'}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  <span className="font-semibold">Roles:</span> {interview?.roles?.join(', ') || 'Not specified'}
                </p>
              </div>

              <button
                onClick={handleContinue}
                className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
              >
                <span>{fieldsData.continueButton}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mt-8"
          >
            <p className="text-sm text-white/80">
              Powered by{' '}
              <span className="font-semibold text-primary-400">
                Crisp AI Interviews
              </span>
            </p>
          </motion.div>
        </div>
      </div>

      <ResumeUploadModal
        isOpen={showResumeModal}
        onClose={handleSkipResume}
        onUpload={handleResumeUpload}
      />
    </div>
  );
}
