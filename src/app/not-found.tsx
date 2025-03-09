export default function NotFound() {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800">404</h1>
          <p className="text-gray-600">Page not found</p>
          <a href="/dashboard/home" className="text-blue-500 hover:text-blue-600 mt-4 inline-block">
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }