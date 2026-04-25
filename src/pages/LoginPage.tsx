import { useIsAuthenticated } from "@azure/msal-react";
import { useMsal } from "@azure/msal-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../config/msalConfig";
import { Button, Center, Stack, Title, Text, Paper } from "@mantine/core";

export function LoginPage() {
  const isAuthenticated = useIsAuthenticated();
  const { instance } = useMsal();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/auth/callback", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLoginRedirect = () => {
    instance.loginRedirect(loginRequest);
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <Center h="100vh">
      <Paper shadow="md" p="xl" radius="md" w={400}>
        <Stack align="center" gap="lg">
          <Title order={2}>Đăng nhập</Title>
          <Text c="dimmed" ta="center">
            Vui lòng đăng nhập bằng tài khoản Microsoft của bạn
          </Text>
          <Button
            fullWidth
            size="md"
            leftSection={
              <svg width="20" height="20" viewBox="0 0 21 21" fill="none">
                <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
                <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
                <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
                <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
              </svg>
            }
            onClick={handleLoginRedirect}
          >
            Đăng nhập bằng Microsoft
          </Button>
        </Stack>
      </Paper>
    </Center>
  );
}