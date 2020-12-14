import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface IBalance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<IBalance> {
    const transactions = await this.find();

    let income = 0;
    let outcome = 0;
    transactions.forEach(element => {
      if (element.type === 'income') income += element.value;
      if (element.type === 'outcome') outcome += element.value;
    });

    return {
      income,
      outcome,
      total: income - outcome,
    };
  }
}

export default TransactionsRepository;
