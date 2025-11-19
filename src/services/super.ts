import { get, put } from "./http/client";
import { Role, User } from "@/types/user";

interface SetRoleRequestBody {
    id: number;
    role: Role;
}

interface GetAllUsersResponseBody {
    totalUserCount: number;
    users: User[];
}

export async function setRole(body: SetRoleRequestBody): Promise<void> {
    const { id, role } = body;
    await put<void, { role: Role }>(`/api/super/set_role/${id}`, { role });
}

export async function getAllUsers(): Promise<GetAllUsersResponseBody> {
    const data = await get<GetAllUsersResponseBody>("/api/super/get_all_users");
    return data;
}
