import { Main } from './main';
import { LoggerService } from './logger/logger.service';
import { UsersController } from './users/users.controller';
import { ExceptionFilter } from './errors/exception.filter';
import { Container, ContainerModule, interfaces } from 'inversify';
import { LoggerInterface } from './logger/logger.interface';
import { TYPES } from './app.types';
import { ExceptionFilterInterface } from './errors/exception.filter.interface';
import { UsersControllerInterface } from './users/users.controller.interface';
import { UserService } from './users/user.service';
import { UserServiceInterface } from './users/user.service.interface';
import { ConfigServiceInterface } from './config/config.service.interface';
import { ConfigService } from './config/config.service';
import { PrismaService } from './database/prisma.service';
import { UsersRepositoryInterface } from './users/users.repository.interface';
import { UsersRepository } from './users/users.repository';

export interface IBootstrapReturn {
	container: Container;
	app: Main;
}

export const appBindings = new ContainerModule((bind: interfaces.Bind) => {
	bind<LoggerInterface>(TYPES.LoggerInterface).to(LoggerService).inSingletonScope();
	bind<ExceptionFilterInterface>(TYPES.ExceptionFilter).to(ExceptionFilter);
	bind<UsersControllerInterface>(TYPES.UsersController).to(UsersController);
	bind<Main>(TYPES.Application).to(Main)
	bind<UserServiceInterface>(TYPES.UserService).to(UserService);
	bind<ConfigServiceInterface>(TYPES.ConfigService).to(ConfigService).inSingletonScope();
	bind<PrismaService>(TYPES.PrismaService).to(PrismaService).inSingletonScope();
	bind<UsersRepositoryInterface>(TYPES.UsersRepository).to(UsersRepository).inSingletonScope()
});

async function bootstrap(): Promise<IBootstrapReturn> {
	const container = new Container();
	container.load(appBindings);
	const app = container.get<Main>(TYPES.Application);
	await app.init();
	return { app, container };
}

export const boot = bootstrap();
