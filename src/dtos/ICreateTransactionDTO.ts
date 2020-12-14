export default interface ICreateTransactionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
  importing?: boolean;
}
