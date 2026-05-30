import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { supabase } from "../lib/supabase";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const applyTheme = useCallback((theme) => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else if (theme === "light") root.classList.remove("dark");
    else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      root.classList.toggle("dark", prefersDark);
    }
  }, []);

  const fetchProfile = useCallback(
    async (userId) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && error.code === "PGRST116") {
        setProfile(null);
      } else if (data) {
        setProfile(data);
        applyTheme(data.theme || "system");
      }
    },
    [applyTheme]
  );

  const updateProfile = useCallback(
    async (updates) => {
      if (!session?.user?.id) return { error: "No session" };
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", session.user.id)
        .select()
        .single();
      if (!error && data) {
        setProfile(data);
        if (updates.theme) applyTheme(updates.theme);
      }
      return { data, error };
    },
    [session, applyTheme]
  );

  const createProfile = useCallback(
    async (profileData) => {
      if (!session?.user?.id) return { error: "No session" };
      const { data, error } = await supabase
        .from("profiles")
        .insert({ id: session.user.id, ...profileData })
        .select()
        .single();
      if (!error && data) setProfile(data);
      return { data, error };
    },
    [session]
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.id) {
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.id) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile?.theme === "system" || !profile?.theme) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (e) =>
        document.documentElement.classList.toggle("dark", e.matches);
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [profile?.theme]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  return (
    <AppContext.Provider
      value={{
        session,
        profile,
        loading,
        isAuthenticated: !!session,
        needsOnboarding: !!session && !profile,
        updateProfile,
        createProfile,
        signOut,
        refetchProfile: () =>
          session?.user?.id && fetchProfile(session.user.id),
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
