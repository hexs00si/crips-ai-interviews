import { useNavigate } from 'react-router-dom';
import { DualAuthLayout } from '@/features/auth/components/DualAuthLayout';
import { LoginFormContent } from '@/features/auth/components/LoginFormContent';
import { AccessCodeForm } from '@/features/candidate/components/AccessCodeForm';
import { CandidateService } from '@/lib/candidateService';
import useCandidateStore from '@/stores/candidateStore';

export function UnifiedAuthPage() {
  const navigate = useNavigate();
  const initializeSession = useCandidateStore((state) => state.initializeSession);

  const handleAccessCodeSubmit = async (accessCode) => {
    try {
      // Use CandidateService to validate and create session (Supabase direct)
      const result = await CandidateService.validateAndCreateSession(accessCode);

      if (!result.success) {
        return {
          success: false,
          error: result.error
        };
      }

      // Store session and interview data in candidateStore
      initializeSession({
        interview: result.interview,
        session: result.session
      });

      // Navigate based on whether candidate info is complete
      const hasInfo = result.session.candidate_name && result.session.candidate_email;

      if (hasInfo) {
        navigate('/candidate/interview');
      } else {
        navigate('/candidate/info');
      }

      return { success: true };
    } catch (error) {
      console.error('Access code validation error:', error);
      return {
        success: false,
        error: 'An error occurred. Please try again.'
      };
    }
  };

  return (
    <DualAuthLayout
      mode="both"
      leftContent={
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Interviewer Login
            </h3>
            <p className="text-sm text-gray-600">
              Sign in to manage your interviews
            </p>
          </div>
          <LoginFormContent />
        </div>
      }
      rightContent={
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Enter Your Interview Code
            </h3>
            <p className="text-sm text-gray-600">
              Enter the access code provided by your interviewer to begin
            </p>
          </div>
          <AccessCodeForm onSubmit={handleAccessCodeSubmit} />
        </div>
      }
    />
  );
}