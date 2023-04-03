-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordRecovery" (
    "recoveryCode" TEXT,
    "expirationDate" TEXT,
    "userId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "EmailConfirmation" (
    "confirmationCode" TEXT NOT NULL,
    "expirationDate" TEXT NOT NULL,
    "isConfirmed" BOOLEAN NOT NULL,
    "userEmail" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordRecovery_userId_key" ON "PasswordRecovery"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailConfirmation_userEmail_key" ON "EmailConfirmation"("userEmail");

-- AddForeignKey
ALTER TABLE "PasswordRecovery" ADD CONSTRAINT "PasswordRecovery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailConfirmation" ADD CONSTRAINT "EmailConfirmation_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;
