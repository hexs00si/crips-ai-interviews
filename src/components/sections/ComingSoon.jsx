export function ComingSoon({ message, description }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600 font-medium mb-2">{message}</p>
      {description && (
        <p className="text-gray-500 text-sm">{description}</p>
      )}
    </div>
  );
}