import api from "../types/api";
import type { UserInfo, UpdateUserRequest } from "../types/auth";

class UserService {
    async updateUser(request: UpdateUserRequest): Promise<UserInfo> {
        const { data } = await api.patch<UserInfo>("/users/update", request);
        return data;
    }

    async deleteAccount(password: string): Promise<{ message: string }> {
        const { data } = await api.delete("/users/delete", {
            data: { password },
        });
        return data;
    }
}

export default new UserService();