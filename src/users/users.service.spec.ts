import 'reflect-metadata';
import { Container } from 'inversify';
import { ConfigServiceInterface } from '../config/config.service.interface';
import { UsersRepositoryInterface } from './users.repository.interface';
import { UserService } from './user.service';
import { TYPES } from '../app.types';
import { UserEntity } from './user.entity';
import { UserModel } from '@prisma/client';

const ConfigServiceMock: ConfigServiceInterface = {
	get: jest.fn()
}

const UserRepoMock: UsersRepositoryInterface = {
	findByEmail: jest.fn(),
	create: jest.fn()
}

const container = new Container();
let configService: ConfigServiceInterface;
let usersRepo: UsersRepositoryInterface;
let usersService: UserService

beforeAll(() => {
	container.bind<UserService>(TYPES.UserService).to(UserService);
	container.bind<ConfigServiceInterface>(TYPES.ConfigService).toConstantValue(ConfigServiceMock);
	container.bind<UsersRepositoryInterface>(TYPES.UsersRepository).toConstantValue(UserRepoMock);

	configService = container.get<ConfigServiceInterface>(TYPES.ConfigService);
	usersRepo = container.get<UsersRepositoryInterface>(TYPES.UsersRepository);
	usersService = container.get<UserService>(TYPES.UserService);
});

let createdUser: UserModel | null;

describe('User Service', () => {
	it('should create user', async () => {
		configService.get = jest.fn().mockReturnValueOnce('1');
		usersRepo.create = jest.fn().mockImplementationOnce((user: UserEntity): UserModel => ({
			name: user.name,
			id: 1,
			password: user.password,
			email: user.email
		}))
		createdUser = await usersService.createUser({
			email: 'some@mail.com',
			name: 'Dmitriy',
			password: '1'
		})
		expect(createdUser?.id).toEqual(1);
		expect(createdUser?.password).not.toEqual('1');
	})

	it('should validate user - success(positive test)', async () => {
		usersRepo.findByEmail = jest.fn().mockImplementationOnce((email: string): UserModel => ({
			name: 'Dmitriy',
			id: 1,
			password: '$2a$04$keGCqxEHms6WzwUIPB0PaO6UdgIgVy/uaAkpd0a0PNvCCnaYsllxm',
			email
		}))
		const isValidated = await usersService.validateUser({
			email: 'some@mail.com',
			password: '1'
		})
		expect(isValidated).toBeTruthy()
	});

	it('should validate user - wrong(negative test)', async () => {
		usersRepo.findByEmail = jest.fn().mockImplementationOnce((email: string): UserModel => ({
			name: 'Dmitriy',
			id: 1,
			password: '$2a$04$keGCqxEHms6WzwUIPB0PaO6UdgIgVy/uaAkpd0a0PNvCCnaYsllxm',
			email
		}))
		const isValidated = await usersService.validateUser({
			email: 'some@mail.com',
			password: '12'
		})
		expect(isValidated).toBeFalsy()
	});
})