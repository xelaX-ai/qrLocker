export type LockerStatus = "available" | "occupied";

export interface Locker {
  id: string;
  locker_number: number;
  owner_name: string | null;
  status: LockerStatus;
  updated_at: string;
  department: string | null;
}

export type UpdateLockerPayload = Partial<Pick<Locker, "owner_name" | "status" | "department">>;
