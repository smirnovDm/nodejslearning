import { inject, injectable } from 'inversify';
// import "reflect-metadata";
import { PrismaClient, UserModel } from '@prisma/client'
import { TYPES } from '../app.types';
import { LoggerInterface } from '../logger/logger.interface';

@injectable()
export class PrismaService{
	client: PrismaClient

	constructor(
		@inject(TYPES.LoggerInterface) private readonly logger: LoggerInterface,
	) {
			this.client = new PrismaClient()
	}

	async connect(): Promise<void> {
		try {
			await this.client.$connect()
			this.logger.log(`[PrismaService] Successfully connected!`)
		} catch (e){
			if(e instanceof Error){
				this.logger.error(e.message)
			}
		}
	}

	async disconnect(): Promise<void> {
		await this.client.$disconnect()
	}
}