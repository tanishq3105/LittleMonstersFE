export default function Loader() {
  return (
    <div className="fixed top-16 left-0 right-0 bottom-0 bg-white flex items-center justify-center z-50">
      <div className="relative w-24 h-24">
        {/* Outer rotating ring */}
        <div className="absolute inset-0 rounded-full border-4 border-gray-200 border-t-amber-400 animate-spin"></div>

        {/* Middle rotating ring with delay */}
        <div
          className="absolute inset-2 rounded-full border-4 border-gray-200 border-b-rose-500 animate-spin"
          style={{ animationDirection: "reverse", animationDelay: "0.3s" }}
        ></div>

        {/* Center logo/icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Shopping bag icon */}
            <svg
              className="w-10 h-10 text-gray-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>

            {/* Pulsing dot */}
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Loading text */}
      <div className="text-center mt-8">
        <p className="text-gray-600 text-sm font-medium">
          Loading your products...
        </p>
      </div>
    </div>
  );
}
