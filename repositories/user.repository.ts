import { BaseRepository } from "./base.repository";
import User, { IUser } from "../models/User";

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    // We explicitly select +passwordHash here so the auth service can compare it.
    // The model has it set to select: false by default.
    return this.model.findOne({ email: email.toLowerCase().trim() }).select("+passwordHash").exec();
  }

  async incrementFailedLogins(email: string): Promise<void> {
    await this.model.updateOne(
      { email: email.toLowerCase().trim() },
      { $inc: { failedLoginAttempts: 1 } }
    ).exec();
  }

  async lockAccount(email: string, lockUntil: Date): Promise<void> {
    await this.model.updateOne(
      { email: email.toLowerCase().trim() },
      { $set: { lockUntil } }
    ).exec();
  }

  async clearLock(email: string): Promise<void> {
    await this.model.updateOne(
      { email: email.toLowerCase().trim() },
      { $set: { failedLoginAttempts: 0, lockUntil: null } }
    ).exec();
  }
  
  async updateLastLogin(id: string): Promise<void> {
    await this.model.findByIdAndUpdate(id, { $set: { lastLoginAt: new Date() } }).exec();
  }

  async deleteUserAndData(userId: string): Promise<void> {
    // Cascading delete
    await this.model.db.collection("diaryentries").deleteMany({ userId: new (require("mongoose").Types.ObjectId)(userId) });
    await this.model.db.collection("auditlogs").deleteMany({ userId: new (require("mongoose").Types.ObjectId)(userId) });
    await this.model.db.collection("passwordresettokens").deleteMany({ userId: new (require("mongoose").Types.ObjectId)(userId) });
    await this.model.findByIdAndDelete(userId).exec();
  }
}

export const userRepository = new UserRepository();
