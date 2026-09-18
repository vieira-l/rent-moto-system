-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'EMPLOYEE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'EMPLOYEE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateTable
CREATE TABLE "Motorcycle" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER,
    "color" TEXT,
    "plate" TEXT NOT NULL,
    "renavam" TEXT,
    "chassis" TEXT,
    "acquisitionDate" TIMESTAMP(3),
    "acquisitionKm" INTEGER NOT NULL DEFAULT 0,
    "currentKm" INTEGER NOT NULL DEFAULT 0,
    "acquisitionValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "marketValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Disponível',
    "lastLicensingDate" TIMESTAMP(3),
    "nextLicensingDue" TIMESTAMP(3),
    "insurer" TEXT,
    "insuranceDue" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Motorcycle_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Motorcycle_plate_key" ON "Motorcycle"("plate");

-- CreateTable
CREATE TABLE "Renter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cpf" TEXT,
    "birthDate" TIMESTAMP(3),
    "phone" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "address" TEXT,
    "cnh" TEXT,
    "cnhCategory" TEXT,
    "cnhValidity" TIMESTAMP(3),
    "registrationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Ativo',
    CONSTRAINT "Renter_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Renter_cpf_key" ON "Renter"("cpf");

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "renterId" TEXT NOT NULL,
    "motorcycleId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "dailyValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "weeklyValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monthlyValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deposit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dueDay" TEXT,
    "periodicity" TEXT NOT NULL DEFAULT 'Semanal',
    "kmLimit" INTEGER NOT NULL DEFAULT 0,
    "kmExcessValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rules" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Ativo',
    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "renterId" TEXT NOT NULL,
    "motorcycleId" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paymentDate" TIMESTAMP(3),
    "expectedValue" DOUBLE PRECISION NOT NULL,
    "paidValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentMethod" TEXT,
    "status" TEXT,
    "notes" TEXT,
    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kmInterval" INTEGER NOT NULL DEFAULT 0,
    "timeIntervalDays" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "MaintenanceType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceRecord" (
    "id" TEXT NOT NULL,
    "motorcycleId" TEXT NOT NULL,
    "typeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "km" INTEGER NOT NULL,
    "partsCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "laborCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vendor" TEXT,
    "notes" TEXT,
    "nextKm" INTEGER,
    "nextDate" TIMESTAMP(3),
    CONSTRAINT "MaintenanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MileageRecord" (
    "id" TEXT NOT NULL,
    "motorcycleId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "km" INTEGER NOT NULL,
    "previousKm" INTEGER NOT NULL,
    "kmDriven" INTEGER NOT NULL,
    "recordedBy" TEXT,
    "notes" TEXT,
    CONSTRAINT "MileageRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "category" TEXT NOT NULL,
    "motorcycleId" TEXT,
    "vendor" TEXT,
    "value" DOUBLE PRECISION NOT NULL,
    "paymentMethod" TEXT,
    "notes" TEXT,
    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Revenue" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "category" TEXT NOT NULL,
    "motorcycleId" TEXT,
    "renterId" TEXT,
    "value" DOUBLE PRECISION NOT NULL,
    "paymentMethod" TEXT,
    "notes" TEXT,
    CONSTRAINT "Revenue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL,
    "motorcycleId" TEXT NOT NULL,
    "renterId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "responsible" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Aberto',
    "description" TEXT,
    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_renterId_fkey" FOREIGN KEY ("renterId") REFERENCES "Renter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_motorcycleId_fkey" FOREIGN KEY ("motorcycleId") REFERENCES "Motorcycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Payment" ADD CONSTRAINT "Payment_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_renterId_fkey" FOREIGN KEY ("renterId") REFERENCES "Renter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "MaintenanceRecord" ADD CONSTRAINT "MaintenanceRecord_motorcycleId_fkey" FOREIGN KEY ("motorcycleId") REFERENCES "Motorcycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MaintenanceRecord" ADD CONSTRAINT "MaintenanceRecord_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "MaintenanceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "MileageRecord" ADD CONSTRAINT "MileageRecord_motorcycleId_fkey" FOREIGN KEY ("motorcycleId") REFERENCES "Motorcycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Expense" ADD CONSTRAINT "Expense_motorcycleId_fkey" FOREIGN KEY ("motorcycleId") REFERENCES "Motorcycle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Revenue" ADD CONSTRAINT "Revenue_motorcycleId_fkey" FOREIGN KEY ("motorcycleId") REFERENCES "Motorcycle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Revenue" ADD CONSTRAINT "Revenue_renterId_fkey" FOREIGN KEY ("renterId") REFERENCES "Renter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Incident" ADD CONSTRAINT "Incident_motorcycleId_fkey" FOREIGN KEY ("motorcycleId") REFERENCES "Motorcycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_renterId_fkey" FOREIGN KEY ("renterId") REFERENCES "Renter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
