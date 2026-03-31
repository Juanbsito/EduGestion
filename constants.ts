
import { EducationLevel, Career } from './types';

export const MONTHLY_FEES: Record<EducationLevel, number> = {
  [EducationLevel.INITIAL]: 15000,
  [EducationLevel.PRIMARY]: 22000,
  [EducationLevel.SECONDARY]: 28000,
  [EducationLevel.TERTIARY]: 35000,
};

export const MOCK_CAREERS: Career[] = [
  { id: 'c1', name: 'Analista de Sistemas', durationYears: 3, level: EducationLevel.TERTIARY },
  { id: 'c2', name: 'Administración de Empresas', durationYears: 3, level: EducationLevel.TERTIARY },
  { id: 'c3', name: 'Psicopedagogía', durationYears: 4, level: EducationLevel.TERTIARY },
];

export const PAYMENT_DUE_DAY = 10;
export const EXAM_RESTRICTION_HOURS = 48;
export const MAX_TERTIARY_CAREERS = 2;
