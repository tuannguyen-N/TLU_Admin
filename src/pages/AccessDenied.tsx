import { Center, Stack, Text, Button } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

export default function AccessDenied() {
  const nav = useNavigate();
  return (
    <Center h="100vh" style={{ backgroundColor: '#f5f5f5' }}>
      <Stack align="center" gap="md">
        <Text size="xl" fw={700} c="red">Truy cập bị từ chối</Text>
        <Text c="dimmed">Bạn không có quyền truy cập vào trang này.</Text>
        <Button onClick={() => nav('/dashboard')}>Quay về Dashboard</Button>
      </Stack>
    </Center>
  );
}
