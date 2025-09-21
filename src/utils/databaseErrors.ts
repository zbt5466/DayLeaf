export class DatabaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage: string
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export const DatabaseErrorCodes = {
  INITIALIZATION_FAILED: 'DB_INIT_FAILED',
  CONNECTION_FAILED: 'DB_CONNECTION_FAILED',
  QUERY_FAILED: 'DB_QUERY_FAILED',
  CONSTRAINT_VIOLATION: 'DB_CONSTRAINT_VIOLATION',
  NOT_FOUND: 'DB_NOT_FOUND',
  DUPLICATE_ENTRY: 'DB_DUPLICATE_ENTRY'
} as const;

export const createDatabaseError = (
  code: string,
  originalError: Error,
  userMessage: string
): DatabaseError => {
  return new DatabaseError(
    `${code}: ${originalError.message}`,
    code,
    userMessage
  );
};

export const handleDatabaseError = (error: any, operation: string): never => {
  console.error(`Database error during ${operation}:`, error);
  
  if (error instanceof DatabaseError) {
    throw error;
  }
  
  // SQLite specific error handling
  if (error.message?.includes('UNIQUE constraint failed')) {
    throw createDatabaseError(
      DatabaseErrorCodes.DUPLICATE_ENTRY,
      error,
      'この日付の日記は既に存在します'
    );
  }
  
  if (error.message?.includes('no such table')) {
    throw createDatabaseError(
      DatabaseErrorCodes.INITIALIZATION_FAILED,
      error,
      'データベースの初期化が必要です'
    );
  }
  
  // Generic database error
  throw createDatabaseError(
    DatabaseErrorCodes.QUERY_FAILED,
    error,
    `${operation}に失敗しました`
  );
};