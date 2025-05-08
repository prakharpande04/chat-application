'use client';

import { Box, Center, Text } from '@chakra-ui/react';

export default function ChatPage() {
  return (
    <Center h="100%" bg="gray.50">
      <Box textAlign="center">
        <Text fontSize="xl" color="gray.500">
          Select a conversation to start chatting
        </Text>
      </Box>
    </Center>
  );
} 