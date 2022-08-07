import { IMiddleware } from './middleware.interface';
import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';

export class AuthMiddleware implements IMiddleware{

	constructor(
		private secret: string
	) {}

	execute(req: Request, res: Response, next: NextFunction){
		if(req.headers.authorization) {
			const token = req.headers.authorization.split(' ')[1]
			verify(token, this.secret, (err, payload) => {
				if(err){
					next()
				} else if (payload){
					if(typeof payload === 'object')
					req.user = payload.email
					next()
				}
			})
		} else {
			next()
		}
	}

}