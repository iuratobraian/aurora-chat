import { useCallback } from "react";

export interface UseAppEventListenersOptions {
  setPestañaActiva: (tab: string) => void;
  setViewingProfileId: (id: string | null) => void;
  setHasNewPosts: (has: boolean) => void;
  setIsRefreshing: (is: boolean) => void;
  setIsChatOpen: (open: boolean) => void;
  setChatCommunityChannel: (channel: string | undefined) => void;
  setChatCommunityName: (name: string | undefined) => void;
  setCommunitySlug: (slug: string | null) => void;
  setSubcommunityParams: (params: { parentSlug: string; subSlug: string } | null) => void;
}

export function useAppEventListeners(options: UseAppEventListenersOptions) {
  const {
    setPestañaActiva,
    setViewingProfileId,
    setHasNewPosts,
    setIsRefreshing,
    setIsChatOpen,
    setChatCommunityChannel,
    setChatCommunityName,
    setCommunitySlug,
    setSubcommunityParams,
  } = options;

  const handleNewPosts = useCallback(
    (e: any) => setHasNewPosts(e.detail),
    [setHasNewPosts],
  );

  const handleRefreshing = useCallback(
    (e: any) => setIsRefreshing(e.detail),
    [setIsRefreshing],
  );

  const handleOpenChat = useCallback(() => setIsChatOpen(true), [setIsChatOpen]);

  const handleOpenCommunityChat = useCallback(
    (e: Event) => {
      const customEvent = e as CustomEvent;
      setChatCommunityChannel(customEvent.detail?.channelId);
      setChatCommunityName(customEvent.detail?.communityName);
      setIsChatOpen(true);
    },
    [setChatCommunityChannel, setChatCommunityName, setIsChatOpen],
  );

  const handleNavigate = useCallback(
    (e: Event) => {
      const customEvent = e as CustomEvent;
      const path =
        typeof customEvent.detail === "string"
          ? customEvent.detail
          : customEvent.detail?.detail;
      if (!path) return;

      if (path === "/" || path === "") {
        setPestañaActiva("comunidad");
        return;
      }

      if (path.startsWith("/u/") || path.startsWith("u/")) {
        const userId = path.replace(/^\/u\//, "").replace(/^u\//, "");
        setViewingProfileId(userId);
        setPestañaActiva("perfil");
      } else if (path.startsWith("/p/") || path.startsWith("p/")) {
        setPestañaActiva("comunidad");
      } else if (path.startsWith("/c/") || path.startsWith("c/")) {
        const parts = path
          .replace(/^\/c\//, "")
          .replace(/^c\//, "")
          .split("/s/");
        if (parts.length === 2) {
          setSubcommunityParams({ parentSlug: parts[0], subSlug: parts[1] });
          setPestañaActiva("subcommunity");
        } else {
          setCommunitySlug(parts[0]);
          setPestañaActiva("community-detail");
        }
      } else if (path.startsWith("/signal/") || path.startsWith("signal/")) {
        setPestañaActiva("signals");
      } else if (path.startsWith("/course/") || path.startsWith("course/")) {
        setPestañaActiva("cursos");
      } else if (path.startsWith("/creator/") || path.startsWith("creator/")) {
        setPestañaActiva("creator");
      } else if (path.startsWith("/checkout/")) {
        const checkoutPart = path.replace("/checkout/", "");
        if (checkoutPart === "success") setPestañaActiva("checkout-success");
        else if (checkoutPart === "cancel") setPestañaActiva("checkout-cancel");
      } else if (path === "/verify-email" || path === "verify-email") {
        setPestañaActiva("verify-email");
      } else if (path === "/reset-password" || path === "reset-password") {
        setPestañaActiva("reset-password");
      } else if (path === "/clear-cache" || path === "clear-cache") {
        setPestañaActiva("clear-cache");
      } else if (path.startsWith("/comunidad/")) {
        setCommunitySlug(path.replace("/comunidad/", ""));
        setPestañaActiva("community-detail");
      } else if (path.startsWith("subcommunity/")) {
        const parts = path.replace("subcommunity/", "").split("/");
        if (parts.length >= 2) {
          setSubcommunityParams({ parentSlug: parts[0], subSlug: parts[1] });
          setPestañaActiva("subcommunity");
        }
      } else if (path === "/crear-comunidad" || path === "crear-comunidad" || path === "/creator-studio" || path === "creator-studio") {
        setPestañaActiva("community-admin");
        if (path.includes("crear") || path.includes("studio")) {
          sessionStorage.setItem("communityAdmin_isCreating", "true");
        }
      } else if (path === "/discover") {
        setPestañaActiva("discover");
      } else if (path.startsWith("/conexiones") || path === "conexiones") {
        setPestañaActiva("configuracion");
        sessionStorage.setItem("navigateToConexionesTab", "1");
      } else if (
        path.startsWith("/admin/") ||
        path.startsWith("admin/") ||
        path.startsWith("admin-") ||
        path === "/admin" ||
        path === "admin"
      ) {
        setPestañaActiva("admin");
        const adminSection = path.replace(/^\/?(admin|admin-panel)\/?/, "");
        if (adminSection) {
          const tab = adminSection.split("?")[0];
          const validTabs = [
            "dashboard",
            "users",
            "posts",
            "communities",
            "signals",
            "propFirms",
            "propfirms",
            "bitacora",
            "ads",
            "marketing",
            "instagram",
            "config",
            "settings",
          ];
          if (validTabs.includes(tab.toLowerCase())) {
            const normalizedTab =
              tab.toLowerCase() === "propfirms"
                ? "propFirms"
                : tab.toLowerCase() === "settings"
                  ? "config"
                  : tab.toLowerCase();
            sessionStorage.setItem("adminPanelTab", normalizedTab);
          }
        }
      } else if (path.startsWith("/")) {
        setPestañaActiva(path.slice(1));
      } else {
        setPestañaActiva(path);
      }
    },
    [
      setPestañaActiva,
      setViewingProfileId,
      setCommunitySlug,
      setSubcommunityParams,
    ],
  );

  const handleDeepLink = useCallback(
    (section: string, options?: any) => {
      if (section === "u" && options?.id) {
        setViewingProfileId(options.id);
        setPestañaActiva("perfil");
      } else if (section === "p" && options?.id) {
        setPestañaActiva("comunidad");
      } else if (section === "c" && options?.id) {
        setCommunitySlug(options.id);
        setPestañaActiva("community-detail");
      } else if (section === "subcommunity" && options?.id && options?.action) {
        setSubcommunityParams({
          parentSlug: options.id,
          subSlug: options.action,
        });
        setPestañaActiva("subcommunity");
      } else if (section === "signal" && options?.id) {
        setPestañaActiva("signals");
      } else if (section === "course" && options?.id) {
        setPestañaActiva("cursos");
      } else if (section === "verify-email") {
        setPestañaActiva("verify-email");
      } else if (section === "reset-password") {
        setPestañaActiva("reset-password");
      } else if (section === "creator" && options?.id) {
        setPestañaActiva("creator");
      } else if (section === "checkout") {
        if (options?.action === "success") setPestañaActiva("checkout-success");
        else setPestañaActiva("checkout-cancel");
      } else if (section === "comunidad" && options?.id) {
        setCommunitySlug(options.id);
        setPestañaActiva("community-detail");
      } else if (section === "academy" && options?.id) {
        setPestañaActiva("comunidad");
      } else if (section === "post" && options?.id) {
        setPestañaActiva("comunidad");
      } else {
        setPestañaActiva(section);
      }
    },
    [
      setPestañaActiva,
      setViewingProfileId,
      setCommunitySlug,
      setSubcommunityParams,
    ],
  );

  return {
    handleNewPosts,
    handleRefreshing,
    handleOpenChat,
    handleOpenCommunityChat,
    handleNavigate,
    handleDeepLink,
  };
}
