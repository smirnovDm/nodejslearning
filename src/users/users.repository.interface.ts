import { UserEntity } from './user.entity';
import { UserModel } from "@prisma/client"

export interface UsersRepositoryInterface{
		create: (user: UserEntity) => Promise<UserModel>;
	  findByEmail: (email: string) => Promise<UserModel | null>;
}