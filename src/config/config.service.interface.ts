export interface ConfigServiceInterface{
	get: <T extends string | number>(key: string) => T;
}