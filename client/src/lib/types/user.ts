export interface Member {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    emailVerify: boolean;
    phoneVerify: boolean;
    profileImage: string;
    loginProvider: string;
    isActive: boolean;
    userId: string;
  }
  
  export interface User {
    id: string;
    username: string;
    real_username: string;
    facebookId: string | null;
    googleId: string | null;
    lineId: string | null;
    discordId: string | null;
    balance: string;
    tier: string;
    createdAt: string;
    updatedAt: string;
    Member: Member;
  }
  