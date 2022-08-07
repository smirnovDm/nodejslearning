import { IsEmail, IsString } from 'class-validator';

export class RegisterDto{
	@IsEmail()
	email: string;
	@IsString({message: "Set password please"})
	password: string;
	@IsString({message: 'Set name please'})
	name: string;
}