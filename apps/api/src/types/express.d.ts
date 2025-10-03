// d.ts file for extending Express Request interface

declare namespace Express {
  export interface Request {
    user?: {
      id: number;
      // Add other user properties if you know them, e.g., roles
      roles?: string[];
    };
  }
}
