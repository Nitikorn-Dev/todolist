import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16 renamed the `middleware.ts` file convention to `proxy.ts`
// (exported function renamed `middleware` -> `proxy`), and this file must
// live next to `app/` (i.e. under src/, since this project uses src/app) —
// it was previously at the project root as `middleware.ts`, which meant it
// was never invoked at all (confirmed: route protection was fully
// bypassed). See node_modules/next/dist/docs/.../file-conventions/proxy.md.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
