import { BaseRepository } from "./base.repository";
import PasswordResetToken, { IPasswordResetToken } from "../models/PasswordResetToken";

export class PasswordResetTokenRepository extends BaseRepository<IPasswordResetToken> {
  constructor() {
    super(PasswordResetToken);
  }

  async invalidateTokensForUser(userId: string): Promise<void> {
    await this.model.updateMany({ userId }, { $set: { used: true } }).exec();
  }
}

export const passwordResetTokenRepository = new PasswordResetTokenRepository();
