'use client';

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';

export function AuthButtons() {
  return (
    <>
      <SignedOut>
        <SignInButton mode="redirect">
          <button className="px-2.5 py-1.5 text-[11px] text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
            Sign in
          </button>
        </SignInButton>
        <SignUpButton mode="redirect">
          <button className="px-2.5 py-1.5 text-[11px] font-medium bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 rounded hover:opacity-80 transition-opacity">
            Sign up
          </button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'w-6 h-6',
            },
          }}
        />
      </SignedIn>
    </>
  );
}
