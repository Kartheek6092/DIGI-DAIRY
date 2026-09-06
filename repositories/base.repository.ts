import { Model, Document, UpdateQuery, Types } from "mongoose";

export class BaseRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  async findById(id: string | Types.ObjectId): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async findOne(filter: any): Promise<T | null> {
    return this.model.findOne(filter).exec();
  }

  async findAll(filter: any = {}, sort: Record<string, 1 | -1> = {}): Promise<T[]> {
    return this.model.find(filter).sort(sort).exec();
  }

  async create(data: Partial<T> | Record<string, unknown>): Promise<T> {
    return this.model.create(data as any);
  }

  async updateById(id: string | Types.ObjectId, data: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async updateOne(filter: any, data: UpdateQuery<T>): Promise<T | null> {
    return this.model.findOneAndUpdate(filter, data, { new: true }).exec();
  }

  async deleteById(id: string | Types.ObjectId): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return result !== null;
  }
  
  async deleteOne(filter: any): Promise<boolean> {
    const result = await this.model.findOneAndDelete(filter).exec();
    return result !== null;
  }

  async exists(filter: any): Promise<boolean> {
    const count = await this.model.countDocuments(filter).exec();
    return count > 0;
  }

  async count(filter: any): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }
}
