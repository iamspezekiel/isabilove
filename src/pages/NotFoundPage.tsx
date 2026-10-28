import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, ArrowRight, AlertCircle } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center py-6 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Icon & Heading */}        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#8c6239]/20 flex items-center justify-center text-[#8c6239] mx-auto shadow-xs">
            <AlertCircle className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-[#2a241c] font-display">
            Page Not Found
          </h1>
          <p className="text-xs text-[#6f665c] max-w-xs mx-auto leading-relaxed">
            The page you&rsquo;re looking for ({location.pathname}) doesn&rsquo;t exist.
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-[#faf6ef] border border-[#8c6239]/25 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
          <div className="text-center space-y-4">
            <Heart className="w-8 h-8 text-[#8c6239]/40 mx-auto" />
            <p className="text-[#6f665c] text-sm leading-relaxed">
              It seems this page has wandered off into the distance. Let&rsquo;s bring you back home.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="w-full sm:w-auto min-h-[48px] px-4 py-2.5 bg-[#2a241c] hover:bg-[#2a241c]/90 text-[#faf6ef] rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5 text-[#8c6239]" />
              Back to Haven
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};