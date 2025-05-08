'use client';

import { Box, Flex } from '@chakra-ui/react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return null;
  }

  return (
    <Flex h="100vh">
      <Box w="300px" borderRight="1px" borderColor="gray.200">
        <Sidebar />
      </Box>
      <Box flex="1">
        {children}
      </Box>
    </Flex>
  );
} 