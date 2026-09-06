import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { userRepository } from "@/repositories/user.repository";
import { connectDB } from "@/lib/db";

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    // Delete user and all associated data (cascading delete)
    await userRepository.deleteUserAndData(session.user.id);
    
    return NextResponse.json({ message: "Account deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { message: "An error occurred while deleting the account" },
      { status: 500 }
    );
  }
}
