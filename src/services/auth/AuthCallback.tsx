import { useEffect, useRef, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";
import { Center, Loader, Text, Stack, Button } from "@mantine/core";
import { API_BASE_URL } from "../../config/api";
import { loginRequest } from "../../config/msalConfig";
import { useRole } from "../../contexts/RoleContext";

interface LoginResponse {
  code: number;
  data: {
    microsoftId: string;
    email: string;
    name: string;
    avatar: string;
    accessToken: string;
    refreshToken: string;
    role?: string;
    roles?: string[];
  } | null;
  message: string;
}

export function AuthCallback() {
  const { instance } = useMsal();
  const navigate = useNavigate();
  const { setRole } = useRole();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const processCallback = async () => {
      try {
        const account = instance.getActiveAccount() ?? instance.getAllAccounts()[0] ?? null;

        if (!account) {
          navigate("/login", { replace: true });
          return;
        }

        if (!instance.getActiveAccount()) {
          instance.setActiveAccount(account);
        }

        const tokenResult = await instance.acquireTokenSilent({
          ...loginRequest,
          account,
        });

        console.log("MSAL access token:", tokenResult.accessToken);

        const response = await fetch(`${API_BASE_URL}/oauth2/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accessToken: tokenResult.accessToken,
            deviceId: "",
            platform: "web",
            fcmToken: "",
          }),
        });

        const resData: LoginResponse = await response.json();

        if (!response.ok || !(resData.code === 0 && resData.data)) {
          setError(resData.message || `Đăng nhập thất bại (${response.status})`);
          setIsLoading(false);
          return;
        }

        // store auth token (prefer accessToken if provided)
        const authTok = resData.data.accessToken || tokenResult.accessToken;
        if (authTok) localStorage.setItem("authToken", authTok);

        const refreshTok = resData.data.refreshToken;
        if (refreshTok) localStorage.setItem("refreshToken", refreshTok);

        // helper to parse JWT payload
        const parseJwt = (t?: string | null) => {
          if (!t) return null;
          try {
            const b = t.split('.')[1];
            const json = decodeURIComponent(
              atob(b.replace(/-/g, '+').replace(/_/g, '/'))
                .split("")
                .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
                .join('')
            );
            return JSON.parse(json);
          } catch {
            return null;
          }
        };

        const jwtPayload = parseJwt(authTok);
        const rawRoles = [
          ...(Array.isArray(jwtPayload?.roles) ? jwtPayload.roles : []),
          ...(Array.isArray(jwtPayload?.role) ? jwtPayload.role : jwtPayload?.role ? [jwtPayload.role] : []),
          ...(Array.isArray(jwtPayload?.authorities) ? jwtPayload.authorities : []),
          ...(Array.isArray(resData.data.roles) ? resData.data.roles : []),
          ...(resData.data.role ? [resData.data.role] : []),
        ];

        const priority = ['ADMIN', 'LECTURER', 'STAFF'];
        const upper = rawRoles.map((r) => String(r).replace(/^ROLE_/i, '').toUpperCase());
        const chosenRole = priority.find((r) => upper.includes(r)) ?? upper[0] ?? 'UNKNOWN';

        const { accessToken, refreshToken, ...userProfile } = resData.data;
        const userInfo = {
          ...userProfile,
          role: chosenRole,
        };

        localStorage.setItem("authToken", accessToken || tokenResult.accessToken);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
        setRole(chosenRole as 'ADMIN' | 'LECTURER' | 'STAFF');
        navigate("/dashboard", { replace: true });
      } catch (err) {
        console.error("Auth error:", err);
        setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
        setIsLoading(false);
      }
    };

    processCallback();
  }, [instance, navigate, setRole]);

  const handleRetry = () => {
    navigate("/login");
  };



  if (isLoading) {
    return (
      <Center h="100vh" style={{ backgroundColor: "#f5f5f5" }}>
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text size="lg">Đang đăng nhập...</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Center h="100vh" style={{ backgroundColor: "#f5f5f5" }}>
      <Stack align="center" gap="lg" p="xl" style={{ backgroundColor: "white", borderRadius: "8px", padding: "40px" }}>
        <Text size="xl" c="red" fw={500}>{error}</Text>
        <Text c="dimmed">Vui lòng thử lại</Text>
        <Button onClick={handleRetry} variant="filled" color="blue">
          Quay về trang đăng nhập
        </Button>
      </Stack>
    </Center>
  );
}