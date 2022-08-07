import { RegisterDto } from './dto/register.dto';
import { UserEntity } from './user.entity';
import { LoginDto } from './dto/login.dto';
import { UserModel } from '@prisma/client';

export interface UserServiceInterface{
	createUser: (user: RegisterDto) => Promise<UserEntity | UserModel | null>
	validateUser: (dto: LoginDto) => Promise<boolean>;
}