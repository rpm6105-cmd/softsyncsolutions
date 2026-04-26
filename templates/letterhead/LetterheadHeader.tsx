import { ImageWithFallback } from './figma/ImageWithFallback';

export function LetterheadHeader() {
  return (
    <div className="relative overflow-hidden pb-6 border-b border-gray-200">
      {/* Subtle gradient accent in corner */}
      <div className="absolute top-0 right-0 w-64 h-32 bg-gradient-to-bl from-blue-100 via-purple-100 to-transparent opacity-30"></div>

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center overflow-hidden">
            <ImageWithFallback
              src="/src/imports/Screenshot_2026-04-10_at_12.25.03 PM.png"
              alt="Softsync Solutions Logo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="text-right space-y-0.5">
          <p className="text-[15px] font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Softsync Solutions
          </p>
          <p className="text-[12px] text-gray-600">contact@softsync.io</p>
          <p className="text-[12px] text-gray-600">+1 (555) 987-6543</p>
          <p className="text-[12px] text-gray-600">www.softsync.io</p>
        </div>
      </div>
    </div>
  );
}
