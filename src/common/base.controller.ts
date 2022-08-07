import { Router } from 'express';
import { RouteInterface } from './route.interface';
import { Response } from 'express';
import { LoggerInterface } from '../logger/logger.interface';
import { injectable } from 'inversify';
import 'reflect-metadata';

@injectable()
export abstract class BaseController {
	private readonly _router: Router;

	constructor(private readonly logger: LoggerInterface) {
		this._router = Router();
	}

	get router() {
		return this._router;
	}

	public created(response: Response) {
		return response.sendStatus(201);
	}

	public send<T>(response: Response, code: number, message: T) {
		response.type('application/json');
		return response.status(code).json(message);
	}

	public ok<T>(response: Response, message: T) {
		return this.send<T>(response, 200, message);
	}

	protected bindRoutes(routes: RouteInterface[]) {
		for (const route of routes) {
			this.logger.log(`[${route.method}] ${route.path}`);
			const middleware = route.middlewares?.map(middleware => middleware.execute.bind(middleware))
			const handler = route.func.bind(this);
			const pipeline = middleware ? [...middleware, handler] : handler
			this.router[route.method](route.path, pipeline);
		}
	}
}
