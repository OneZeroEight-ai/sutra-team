import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-sutra-bg">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-zinc-900 border border-zinc-800 shadow-2xl",
            headerTitle: "text-white",
            headerSubtitle: "text-zinc-400",
            socialButtonsBlockButton:
              "bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700",
            formButtonPrimary: "bg-violet-600 hover:bg-violet-700",
            footerActionLink: "text-violet-400 hover:text-violet-300",
            formFieldInput: "bg-zinc-800 border-zinc-700 text-white",
            formFieldLabel: "text-zinc-400",
            identityPreviewEditButton: "text-violet-400",
          },
        }}
      />
    </div>
  );
}
