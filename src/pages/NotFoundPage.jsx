import { errorMessages } from '@/data/errorMessages';
import { ErrorMessage } from '@/components/sections/ErrorMessage';

export function NotFoundPage() {
  return <ErrorMessage errorData={errorMessages.notFound} />;
}