import { ConfigServiceInterface } from './config.service.interface';
import { config, DotenvParseOutput } from 'dotenv';
import { LoggerInterface } from '../logger/logger.interface';
import { inject, injectable } from 'inversify';
import { TYPES } from '../app.types';

@injectable()
export class ConfigService implements ConfigServiceInterface{

	private readonly config: DotenvParseOutput

	constructor(
		@inject(TYPES.LoggerInterface) private readonly logger: LoggerInterface
	) {
		const result = config()
		if(result.error){
			this.logger.error(result.error.message)
		} else {
			this.logger.log('Configuration has loaded.')
			this.config = result.parsed as DotenvParseOutput
		}
	}

	get<T extends string | number>(key: string){
		return this.config[key] as T
	}
}