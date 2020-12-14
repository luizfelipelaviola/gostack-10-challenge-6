import { getCustomRepository, getRepository } from 'typeorm';

// Error import
import AppError from '../errors/AppError';

// Model import
import Category from '../models/Category';
import Transaction from '../models/Transaction';

// Repository import
import TransactionsRepository from '../repositories/TransactionsRepository';

// DTO import
import ICreateTransactionDTO from '../dtos/ICreateTransactionDTO';

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
    importing = false,
  }: ICreateTransactionDTO): Promise<Transaction> {
    if (!title) throw new AppError('Transaction title must not be empty');

    if (value <= 0) throw new AppError('Value must be greater than zero');

    if (type !== 'income' && type !== 'outcome')
      throw new AppError('Invalid transaction type');

    if (!category) throw new AppError('Transaction category must not be empty');

    const categoryRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionsRepository);

    const { total } = await transactionRepository.getBalance();

    if (!importing)
      if (type === 'outcome' && value > total)
        throw new AppError('Not enough incomes');

    const transactionFind = await categoryRepository.findOne({
      title: category,
    });

    let transactionCategory: Category;

    if (transactionFind) transactionCategory = transactionFind;
    else {
      transactionCategory = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(transactionCategory);
    }

    const transaction = transactionRepository.create({
      category: transactionCategory,
      title,
      type,
      value,
    });

    return transactionRepository.save(transaction);
  }
}

export default CreateTransactionService;
