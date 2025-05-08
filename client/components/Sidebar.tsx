'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Avatar,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from '@chakra-ui/react';
import { SearchIcon, AddIcon } from '@chakra-ui/icons';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  avatar: string;
  status: string;
}

export default function Sidebar() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, logout } = useAuth();
  const { socket } = useSocket();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('userStatus', ({ userId, status }) => {
        setUsers(prevUsers =>
          prevUsers.map(u =>
            u.id === userId ? { ...u, status } : u
          )
        );
      });
    }
  }, [socket]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box h="100%" borderRight="1px" borderColor="gray.200">
      <VStack h="100%" spacing={0}>
        {/* User profile */}
        <Box w="100%" p={4} borderBottom="1px" borderColor="gray.200">
          <HStack spacing={3}>
            <Avatar size="sm" src={user?.avatar} name={user?.username} />
            <Text fontWeight="bold">{user?.username}</Text>
          </HStack>
        </Box>

        {/* Search */}
        <Box w="100%" p={4}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
        </Box>

        {/* User list */}
        <Box w="100%" flex="1" overflowY="auto">
          <VStack spacing={0}>
            {filteredUsers.map((user) => (
              <Box
                key={user.id}
                w="100%"
                p={4}
                _hover={{ bg: 'gray.50' }}
                cursor="pointer"
                borderBottom="1px"
                borderColor="gray.100"
              >
                <HStack spacing={3}>
                  <Avatar size="sm" src={user.avatar} name={user.username} />
                  <Box flex="1">
                    <Text fontWeight="medium">{user.username}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {user.status}
                    </Text>
                  </Box>
                </HStack>
              </Box>
            ))}
          </VStack>
        </Box>

        {/* Add user button */}
        <Box w="100%" p={4} borderTop="1px" borderColor="gray.200">
          <IconButton
            aria-label="Add user"
            icon={<AddIcon />}
            onClick={onOpen}
            colorScheme="blue"
            variant="ghost"
            w="100%"
          />
        </Box>
      </VStack>

      {/* Add user drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Add New User</DrawerHeader>
          <DrawerBody>
            {/* Add user form will go here */}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
} 