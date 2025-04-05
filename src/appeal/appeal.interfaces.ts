import { Appeal } from '@prisma/client';
import { PartialFields } from 'src/common/common.types';

export type IAppeal = PartialFields<
	Appeal,
	'date' | 'files' | 'id' | 'solution' | 'status' | 'dateSolution' | 'dateCancellation' | 'reasonForCancellation'
>;

export interface AppealListFilters {
	startDate?: Date;
	endDate?: Date;
}
