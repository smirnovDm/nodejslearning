import { BaseController } from '../common/base.controller';
import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors/http-error';
import { inject, injectable } from 'inversify';
import { TYPES } from '../app.types';
import { LoggerInterface } from '../logger/logger.interface';
import 'reflect-metadata';
import { UsersControllerInterface } from './users.controller.interface';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserService } from './user.service';
import { ValidateMiddleware } from '../common/validate.middleware';
import { sign } from 'jsonwebtoken'
import { ConfigServiceInterface } from '../config/config.service.interface';
import { JwtGuardMiddleware } from '../common/jwt.guard.middleware';

@injectable()
export class UsersController extends BaseController implements UsersControllerInterface {
	constructor(
		@inject(TYPES.LoggerInterface) private readonly loggerService: LoggerInterface,
		@inject(TYPES.UserService) private readonly userService: UserService,
		@inject(TYPES.ConfigService) private readonly configService: ConfigServiceInterface
	) {
		super(loggerService);
		this.bindRoutes([
			{ path: '/register', method: 'post', func: this.register, middlewares: [new ValidateMiddleware(RegisterDto)] },
			{ path: '/login', method: 'post', func: this.login, middlewares: [new ValidateMiddleware(LoginDto)] },
			{ path: '/info', method: 'get', func: this.info, middlewares: [new JwtGuardMiddleware()] },
		]);
	}

	async login(req: Request<{}, {}, LoginDto>, res: Response, next: NextFunction) {
		const isValidated = await this.userService.validateUser(req.body)
		if(isValidated) {
			const jwt = await this.signJWT(req.body.email, this.configService.get<string>('SECRET') || 'shit')
			return this.ok(res, {jwt});
		} else {
			return next(new HttpError(401, 'Unauthorized'));
		}
	}

	async register({body}: Request<{}, {}, RegisterDto>, res: Response, next: NextFunction) {
		const newUser = await this.userService.createUser(body)
		if(!newUser){
			return next(new HttpError(422, 'User has already exists.'))
		}
		this.ok(res, {email: newUser?.email, id: newUser?.id});
	}

	async info({user}: Request, res: Response, next: NextFunction) {
		const u = await this.userService.findUserByEmail(user)
		if(!u){
			return next(new HttpError(401, 'Unauthorized.'))
		}
		this.ok(res, {email: user, id: u.id});
	}

	private signJWT(email: string, secret: string): Promise<string>{
		return new Promise((resolve, reject) => {
				sign({
					email,
					iat: Math.floor(Date.now() / 1000)
				}, secret, {
					algorithm: 'HS256',
				}, (err, token) => {
					if (err) reject(err.message)
					else resolve(token as string)
				})
		})
	}
}
