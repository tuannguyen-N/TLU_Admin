import { useEffect, useRef, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";
import { Center, Loader, Text, Stack, Button } from "@mantine/core";
import { API_BASE_URL } from "../../config/api";
import { loginRequest } from "../../config/msalConfig";

interface LoginResponse {
  code: number;
  data: {
    microsoftId: string;
    email: string;
    name: string;
    avatar: string;
    token: string;
    role?: 'admin' | 'lecturer' | 'staff';
  } | null;
  message: string;
}

export function AuthCallback() {
  const { instance } = useMsal();
  const navigate = useNavigate();
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

        localStorage.setItem("authToken", resData.data.token);
        // Persist userInfo including role when provided by backend
        localStorage.setItem("userInfo", JSON.stringify(resData.data));
        navigate("/dashboard", { replace: true });
      } catch (err) {
        console.error("Auth error:", err);
        setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
        setIsLoading(false);
      }
    };

    processCallback();
  }, [instance, navigate]);

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