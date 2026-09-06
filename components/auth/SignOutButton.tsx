"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

export function SignOutButton() {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      <button
        onClick={() => setShowConfirmModal(true)}
        disabled={isSigningOut}
        className="px-4 py-2 rounded-full text-sm font-medium text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:bg-zinc-200 dark:hover:bg-white/10 transition-all hover:scale-105 active:scale-95 disabled:opacity-70"
      >
        {isSigningOut ? "Signing Out..." : "Sign Out"}
      </button>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        // <div className="absolute  top-50">
          <div className="fixed inset-0 w-[95vw] h-[95vh] z-[100] flex items-start justify-center pt-40 bg-zinc-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-white/10 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 dark:!bg-zinc-900 ">
                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Sign out of Digi-Dairy?</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
                  Are you sure you want to sign out? You will need to enter your credentials to log back in.
                </p>

                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center disabled:opacity-70"
                  >
                    {isSigningOut ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      "Yes, sign out"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(false)}
                    disabled={isSigningOut}
                    className="w-full px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-medium rounded-xl transition-colors border border-transparent"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        // </div>
      )}
    </>
  );
}
