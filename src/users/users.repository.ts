import { UsersRepositoryInterface } from './users.repository.interface';
import { UserEntity } from './user.entity';
import { inject, injectable } from 'inversify';
import "reflect-metadata"
import { TYPES } from '../app.types';
import { PrismaService } from '../database/prisma.service';
import { UserModel } from "@prisma/client"

@injectable()
export class UsersRepository implements UsersRepositoryInterface{

	constructor(
		@inject(TYPES.PrismaService) private readonly prismaService: PrismaService
	) {}

	async create({email, password, name}: UserEntity): Promise<UserModel>{
		return await this.prismaService.client.userModel.create({
			data: {email, password, name}
		})
	}

	async findByEmail(email: string): Promise<UserModel | null>{
		return await this.prismaService.client.userModel.findFirst({where: { email } })
	}

}