// Типы для базы данных и приложения

export type LockerStatus = "available" | "occupied";

// Структура ячейки локера из Supabase
export interface Locker {
  id: string;
  locker_number: number;
  owner_name: string | null;
  status: LockerStatus;
  updated_at: string;
}

// Данные для обновления локера (все поля опциональны)
export type UpdateLockerPayload = Partial<
  Pick<Locker, "owner_name" | "status">
>;
