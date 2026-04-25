import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";
import { Center, Loader, Text, Stack, Button } from "@mantine/core";
import { API_BASE_URL } from "../../config/api";

interface LoginResponse {
  code: number;
  data: {
    microsoftId: string;
    email: string;
    name: string;
    avatar: string;
    token: string;
  } | null;
  message: string;
}

export function AuthCallback() {
  const { instance } = useMsal();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      try {
        const result = await instance.handleRedirectPromise();

        if (!result) {
          navigate("/login");
          return;
        }

        console.log("Microsoft Access Token:", result.accessToken);

        const response = await fetch(`${API_BASE_URL}/oauth2/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accessToken: result.accessToken,
            deviceId: "",
            platform: "web",
            fcmToken: "",
          }),
        });

        const resData: LoginResponse = await response.json();

        if (resData.code === 0 && resData.data) {
          localStorage.setItem("authToken", resData.data.token);
          localStorage.setItem("userInfo", JSON.stringify(resData.data));
          navigate("/dashboard");
        } else {
          setError(resData.message || "Đăng nhập thất bại");
          setIsLoading(false);
        }
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