// src/composables/useApi.ts
import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";

interface ApiResponse<T> {
    data: T;
    error: string | null;
}

const BASE_URL = "http://localhost:3000"; // Настроить под ваш API

export async function useApi<T>(
    endpoint: string,
    options?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
    try {
        const response: AxiosResponse<T> = await axios({
            url: `${BASE_URL}${endpoint}`,
            ...options,
        });
        return { data: response.data, error: null };
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            const serverMessage =
                error.response?.data?.message || error.message;
            return { data: error as T, error: serverMessage };
        } else {
            return { data: error as T, error: "Неизвестная ошибка" };
        }
    }
}
