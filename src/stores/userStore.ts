import { defineStore } from "pinia";
import { ref, computed } from "vue";

interface UserInterface {
    role: string | null;
    isAuthenticated: boolean;
}

let baseUserJson: string = '{"role": null, "isAuthenticated": false}'; // Json для неавторизованного пользователя

export const useUserStore = defineStore("user", () => {
    const user = ref<UserInterface>(
        JSON.parse(localStorage.getItem("user") || baseUserJson)
    );

    const isAdmin = computed(() => user.value.role === "admin");
    const isAuthenticated = computed(() => user.value.isAuthenticated);

    function login(role: string) {
        user.value = { role, isAuthenticated: true };
        localStorage.setItem("user", JSON.stringify(user.value));
    }

    function logout() {
        user.value = { role: null, isAuthenticated: false };
        localStorage.removeItem("user");
    }

    return { user, isAdmin, isAuthenticated, login, logout };
});
