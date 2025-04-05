import { Appeal } from '@prisma/client';
import { PartialFields } from 'src/common/common.types';
import { UserEntity } from 'src/user/entities/user.entity';

export type IAppeal = Omit<
	PartialFields<
		Appeal,
		| 'date'
		| 'adminId'
		| 'files'
		| 'id'
		| 'solution'
		| 'status'
		| 'dateSolution'
		| 'dateCancellation'
		| 'reasonForCancellation'
	>,
	'userId' | 'adminId'
> & { user: UserEntity; admin?: UserEntity };

export interface AppealListFilters {
	startDate?: Date;
	endDate?: Date;
}
