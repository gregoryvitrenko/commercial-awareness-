import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col">
      {/* Minimal header */}
      <header className="border-b border-stone-200 dark:border-stone-800">
        <div className="h-[3px] bg-stone-900 dark:bg-stone-100" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 text-center">
          <Link href="/" className="inline-block">
            <h1 className="font-serif text-[22px] sm:text-[28px] font-bold tracking-tight text-stone-900 dark:text-stone-50 hover:opacity-75 transition-opacity">
              Commercial Awareness
            </h1>
          </Link>
        </div>
      </header>

      {/* Sign-in form */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <SignIn
          appearance={{
            elements: {
              rootBox: 'w-full max-w-sm',
              card: 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-none p-6',
              headerTitle: 'font-serif text-xl font-bold text-zinc-900 dark:text-zinc-50',
              headerSubtitle: 'text-[13px] text-zinc-500 dark:text-zinc-400',
              socialButtonsBlockButton: 'border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-[13px] hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors',
              dividerLine: 'bg-zinc-200 dark:bg-zinc-700',
              dividerText: 'text-zinc-400 dark:text-zinc-500 text-[11px]',
              formFieldLabel: 'text-[12px] font-medium text-zinc-700 dark:text-zinc-300',
              formFieldInput: 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[14px] text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500',
              formButtonPrimary: 'bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 rounded-lg text-[13px] font-medium hover:opacity-80 transition-opacity shadow-none',
              footerActionLink: 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium',
              identityPreviewText: 'text-zinc-700 dark:text-zinc-300 text-[13px]',
              identityPreviewEditButton: 'text-zinc-500 dark:text-zinc-400',
              formFieldSuccessText: 'text-emerald-600 dark:text-emerald-400 text-[12px]',
              formFieldErrorText: 'text-rose-600 dark:text-rose-400 text-[12px]',
              alertText: 'text-[13px]',
            },
          }}
        />
      </main>
    </div>
  );
}
