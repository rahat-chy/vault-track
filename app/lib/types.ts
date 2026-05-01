export type LoanType = 'GIVEN' | 'TAKEN';
export type LoanStatus = 'ACTIVE' | 'CLOSED' | 'DEFAULTED';

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
