export function PageHeader({ title, subtitle }) {
  return (
    <div className="text-center mb-16">
      <h1 className="text-4xl font-black text-gray-900 mb-6">{title}</h1>
      {subtitle && (
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}