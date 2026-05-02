import {
  InvestmentStatus,
  LoanStatus,
  LoanType,
} from '@/app/generated/prisma/enums';

export { LoanType, LoanStatus, InvestmentStatus };

export interface Person {
  id: string;
  name: string;
  phone: string;
}

export interface Loan {
  id: string;
  personId: string;
  principalAmount: string | number;
  startDate: string;
  dueDate: string;
  returnDate: string | null;
  status: LoanStatus;
  totalPaid: string | number;
  type: LoanType;
  notes: string | null;
  person: Person;
}

export interface LoanPayment {
  id: string;
  loanId: string;
  amount: string | number;
  paidAt: string;
  notes: string | null;
  createdAt: string;
}

export interface LoanFormData {
  personId: string;
  principalAmount: string;
  startDate: string;
  dueDate: string;
  status: string;
  notes: string;
}

export interface OneTimeInvestment {
  id: string;
  name: string;
  investedAmount: string | number;
  investmentDate: string;
  discountAmount: string | number | null;
  exitDate: string | null;
  returnAmount: string | number;
  status: InvestmentStatus;
  description: string | null;
  createdAt: string;
}

export interface OneTimeInvestmentReturn {
  id: string;
  investmentId: string;
  amount: string | number;
  receivedAt: string;
  notes: string | null;
  createdAt: string;
}

export interface InvestmentFormData {
  name: string;
  investedAmount: string;
  investmentDate: string;
  discountAmount: string;
  exitDate: string;
  status: string;
  description: string;
}
