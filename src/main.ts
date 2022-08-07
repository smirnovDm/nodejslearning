import express, { Express } from 'express';
import { LoggerInterface } from './logger/logger.interface';
import { inject, injectable } from 'inversify';
import { TYPES } from './app.types';
import 'reflect-metadata';
import bodyParser from 'body-parser';
import { ExceptionFilterInterface } from './errors/exception.filter.interface';
import { ConfigServiceInterface } from './config/config.service.interface';
import { UsersController } from './users/users.controller';
import { PrismaService } from './database/prisma.service';
import { AuthMiddleware } from './common/auth.middleware';
import { Server } from 'http';

@injectable()
export class Main {

	app: Express;
	port: number;
	server: Server;

	constructor(
		@inject(TYPES.LoggerInterface) private readonly logger: LoggerInterface,
		@inject(TYPES.UsersController) private readonly userController: UsersController,
		@inject(TYPES.ExceptionFilter) private readonly exceptionFilter: ExceptionFilterInterface,
		@inject(TYPES.ConfigService) private readonly configService: ConfigServiceInterface,
		@inject(TYPES.PrismaService) private readonly prismaService: PrismaService
	) {
		this.app = express();
		this.port = 8000;
	}

	useMiddlewares(){
		this.app.use(bodyParser.json())
		const authMiddleware = new AuthMiddleware(this.configService.get<string>('SECRET'))
		this.app.use(authMiddleware.execute.bind(authMiddleware))
	}

	useRoutes() {
		this.app.use('/users', this.userController.router);
	}

	useExceptionFilters() {
		this.app.use(this.exceptionFilter.catch.bind(this.exceptionFilter));
	}

	public async init() {
		this.useMiddlewares();
		this.useRoutes();
		this.useExceptionFilters();
		await this.prismaService.connect();
		this.server = this.app.listen(this.port);
		this.logger.log('server is listening: ' + `http://localhost:${this.port}`);
	}

	public close(){
		this.server.close()
	}
}
