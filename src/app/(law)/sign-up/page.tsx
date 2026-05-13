import { SignUp } from "@clerk/nextjs";

export default function LawSignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-950">
      <div className="max-w-md w-full px-4">
        <h1 className="text-2xl font-bold text-stone-100 mb-2 text-center">
          Sign up for the Legal Council
        </h1>
        <p className="text-stone-400 mb-6 text-center">
          Full Council subscription — $299/month per seat.
          After signup, you&apos;ll be taken to billing.
        </p>
        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          forceRedirectUrl="/checkout/law-full-council"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-zinc-900 border border-zinc-800 shadow-2xl",
              headerTitle: "text-white",
              headerSubtitle: "text-zinc-400",
              socialButtonsBlockButton:
                "bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700",
              formButtonPrimary: "bg-amber-700 hover:bg-amber-600",
              footerActionLink: "text-amber-400 hover:text-amber-300",
              formFieldInput: "bg-zinc-800 border-zinc-700 text-white",
              formFieldLabel: "text-zinc-400",
            },
          }}
        />
      </div>
    </div>
  );
}
