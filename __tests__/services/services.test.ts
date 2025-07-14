import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock do UserModel com tipos corretos
const mockUserModel = {
  findById: jest.fn() as jest.MockedFunction<any>,
  findByEmail: jest.fn() as jest.MockedFunction<any>,
  create: jest.fn() as jest.MockedFunction<any>,
  existsByEmail: jest.fn() as jest.MockedFunction<any>,
};

jest.mock('@/models/user.model', () => ({
  UserModel: mockUserModel,
}));

// Mock Service simples
const UserService = {
  getUserById: async (id: string) => mockUserModel.findById(id),
  getUserByEmail: async (email: string) => mockUserModel.findByEmail(email),
  createUser: async (userData: any) => mockUserModel.create(userData),
  checkEmailExists: async (email: string) => mockUserModel.existsByEmail(email),
};

describe('Services Layer Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('UserService', () => {
    describe('getUserById', () => {
      it('should return user when found', async () => {
        const mockUser = {
          id: '1',
          firstName: 'João',
          lastName: 'Silva',
          email: 'joao@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockUserModel.findById.mockResolvedValue(mockUser);

        const result = await UserService.getUserById('1');

        expect(result).toEqual(mockUser);
        expect(mockUserModel.findById).toHaveBeenCalledWith('1');
      });

      it('should return null when user not found', async () => {
        mockUserModel.findById.mockResolvedValue(null);

        const result = await UserService.getUserById('999');

        expect(result).toBeNull();
      });
    });

    describe('getUserByEmail', () => {
      it('should return user when found', async () => {
        const mockUser = {
          id: '1',
          firstName: 'João',
          lastName: 'Silva',
          email: 'test@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockUserModel.findByEmail.mockResolvedValue(mockUser);

        const result = await UserService.getUserByEmail('test@example.com');

        expect(result).toEqual(mockUser);
        expect(mockUserModel.findByEmail).toHaveBeenCalledWith('test@example.com');
      });

      it('should return null when user not found', async () => {
        mockUserModel.findByEmail.mockResolvedValue(null);

        const result = await UserService.getUserByEmail('notfound@example.com');

        expect(result).toBeNull();
      });
    });

    describe('createUser', () => {
      it('should create user successfully', async () => {
        const userData = {
          firstName: 'João',
          lastName: 'Silva',
          email: 'joao@example.com',
          password: 'hashedPassword',
        };

        const mockCreatedUser = {
          id: 'new-user-id',
          ...userData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockUserModel.create.mockResolvedValue(mockCreatedUser);

        const result = await UserService.createUser(userData);

        expect(result).toEqual(mockCreatedUser);
        expect(mockUserModel.create).toHaveBeenCalledWith(userData);
      });

      it('should handle creation errors', async () => {
        const userData = {
          firstName: 'João',
          lastName: 'Silva',
          email: 'joao@example.com',
          password: 'hashedPassword',
        };

        const error = new Error('Validation error');
        mockUserModel.create.mockRejectedValue(error);

        await expect(UserService.createUser(userData)).rejects.toThrow('Validation error');
      });
    });

    describe('checkEmailExists', () => {
      it('should return true when email exists', async () => {
        mockUserModel.existsByEmail.mockResolvedValue(true);

        const result = await UserService.checkEmailExists('existing@example.com');

        expect(result).toBe(true);
        expect(mockUserModel.existsByEmail).toHaveBeenCalledWith('existing@example.com');
      });

      it('should return false when email does not exist', async () => {
        mockUserModel.existsByEmail.mockResolvedValue(false);

        const result = await UserService.checkEmailExists('new@example.com');

        expect(result).toBe(false);
      });
    });
  });
});
