import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import bcrypt from "bcryptjs";

export const createAdminBraiurato = action({
  args: {},
  handler: async (ctx): Promise<any> => {
    console.log("Starting createAdminBraiurato action...");
    const password = "221707";
    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password hashed successfully.");
    
    console.log("Running internal mutation upsertAdminBraiurato...");
    const result = await ctx.runMutation(internal.profiles.upsertAdminBraiurato, {
      hashedPassword
    });
    console.log("Mutation result:", result);
    
    return result;
  }
});
