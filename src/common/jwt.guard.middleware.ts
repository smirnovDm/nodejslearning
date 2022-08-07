import { IMiddleware } from './middleware.interface';
import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../errors/http-error';

export class JwtGuardMiddleware implements IMiddleware {

	execute(req: Request, res: Response, next: NextFunction){
		const email = req.user
		if(!email){
			return next(new HttpError(401, 'Unauthorized.'))
		}
		return next()
	}

}
