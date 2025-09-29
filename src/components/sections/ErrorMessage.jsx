export function ErrorMessage({ errorData }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{errorData.code}</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">{errorData.title}</h2>
        <p className="text-gray-600 mb-8">{errorData.message}</p>
        <a
          href={errorData.actionHref}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {errorData.actionText}
        </a>
      </div>
    </div>
  );
}