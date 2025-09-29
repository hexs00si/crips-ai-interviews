import { errorMessages } from '@/data/errorMessages';
import { ErrorMessage } from '@/components/sections/ErrorMessage';

export function UnauthorizedPage() {
  return <ErrorMessage errorData={errorMessages.unauthorized} />;
}