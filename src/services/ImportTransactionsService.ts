import { Readable } from 'stream';
import parse from 'csv-parse/lib/sync';
import ICreateTransactionDTO from '../dtos/ICreateTransactionDTO';
import CreateTransactionService from './CreateTransactionService';

interface ICsvRecords {
  title: string;
  type: 'income' | 'outcome';
  value: string;
  category: string;
}

class ImportTransactionsService {
  async execute(file: Buffer): Promise<void> {
    const stream = Readable.from(file.toString());
    const createTransactionService = new CreateTransactionService();
    return new Promise(resolve => {
      stream.on('data', async data => {
        const parsed = parse(data, {
          columns: true,
          skip_empty_lines: true,
          delimiter: ', ',
        });
        const records = parsed.map(
          (transaction: ICsvRecords): ICreateTransactionDTO => ({
            title: transaction.title,
            type: transaction.type,
            value: Number(transaction.value),
            category: transaction.category,
            importing: true,
          }),
        );
        const promises = records.map(async (fields: ICreateTransactionDTO) =>
          createTransactionService.execute(fields),
        );
        await Promise.all(promises);
        resolve();
      });
    });
  }
}

export default ImportTransactionsService;
