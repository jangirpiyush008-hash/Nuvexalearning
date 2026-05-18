import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase, supabaseConfigured } from "@/core/supabase/client";

// Demo credentials — bypass Supabase entirely so you can test UI without backend.
// Remove before shipping.
export const DEMO_EMAIL = "demo@nuvexa.com";
export const DEMO_PASSWORD = "demo1234";

const DEMO_USER = {
  id: "demo-user-id-00000000",
  email: DEMO_EMAIL,
  user_metadata: { display_name: "Demo Learner" },
} as unknown as User;

type AuthState = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isDemo: boolean;
  signInDemo: () => void;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthState>({
  session: null,
  user: null,
  loading: true,
  isDemo: false,
  signInDemo: () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabaseConfigured) {
      setLoading(false);
      return;
    }
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .catch(() => undefined)
      .finally(() => setLoading(false));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setIsDemo(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signInDemo = useCallback(() => {
    setIsDemo(true);
    setSession({
      access_token: "demo",
      refresh_token: "demo",
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: "bearer",
      user: DEMO_USER,
    } as Session);
  }, []);

  const signOut = useCallback(async () => {
    if (isDemo) {
      setIsDemo(false);
      setSession(null);
      return;
    }
    await supabase.auth.signOut();
  }, [isDemo]);

  return (
    <Ctx.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        isDemo,
        signInDemo,
        signOut,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  return useContext(Ctx);
}
