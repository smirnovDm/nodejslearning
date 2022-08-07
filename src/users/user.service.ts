import { inject, injectable } from 'inversify';
import 'reflect-metadata'
import { RegisterDto } from './dto/register.dto';
import { UserEntity } from './user.entity';
import { UserServiceInterface } from './user.service.interface';
import { LoginDto } from './dto/login.dto';
import { TYPES } from '../app.types';
import { ConfigServiceInterface } from '../config/config.service.interface';
import { UsersRepository } from './users.repository';
import { UserModel } from "@prisma/client";
import { compare } from 'bcryptjs';
import * as assert from 'assert';

@injectable()
export class UserService implements UserServiceInterface{

	constructor(
		@inject(TYPES.ConfigService) private readonly configService: ConfigServiceInterface,
		@inject(TYPES.UsersRepository) private readonly usersRepo: UsersRepository
	) {}

	async createUser(user: RegisterDto): Promise<UserModel | null> {
		const newUser = new UserEntity(user.email, user.name)
		const salt = this.configService.get<number>('SALT')
		await newUser.setPassword(user.password, salt)
		const u = await this.usersRepo.findByEmail(user.email)
		if(u){
			return null
		}
		return await this.usersRepo.create(newUser)
	}

	async validateUser({ email, password }: LoginDto): Promise<boolean> {
		const user = await this.usersRepo.findByEmail(email)
		return !!user && await this.isPasswordVerified(password, user?.password)
	}

	async findUserByEmail(email: string): Promise<UserModel | null>{
		return await this.usersRepo.findByEmail(email)
	}

	private async isPasswordVerified(requestPassword: string, databasePassword: string): Promise<boolean>{
		return await compare(requestPassword, databasePassword)
	}
}
