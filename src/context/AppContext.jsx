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
  const [profileLoading, setProfileLoading] = useState(true);

  const applyTheme = useCallback((theme) => {
    const root = document.documentElement;
    localStorage.setItem("cerebra_theme", theme);
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, []);

  const fetchProfile = useCallback(
    async (userId) => {
      setProfileLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error && error.code === "PGRST116") {
          setProfile(null);
        } else if (data) {
          setProfile(data);
          applyTheme(data.theme || "light");
        }
      } catch (err) {
        console.error("fetchProfile error:", err);
      } finally {
        setProfileLoading(false);
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
        setProfileLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.id) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setProfileLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

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
        profileLoading,
        isAuthenticated: !!session,
        needsOnboarding:
          !!session &&
          !profileLoading &&
          (!profile || profile.onboarding_complete === false),
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
