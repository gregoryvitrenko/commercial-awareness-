import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const REVIEW_SECRET = 'folio-rev-xK9mP7wQ2';

export default clerkMiddleware(async (auth, req) => {
  const url = new URL(req.url);

  const reviewKey = url.searchParams.get('review_key');

  if (reviewKey === REVIEW_SECRET) {
    url.searchParams.delete('review_key');
    const response = NextResponse.redirect(url);
    response.cookies.set('folio-review-access', '1', {
      httpOnly: true,
      secure: true,
      maxAge: 86400, // 24 hours
      sameSite: 'lax',
    });
    return response;
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
