import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import Layout from "@/views/Layout.vue";
import AnimalsView from "@/views/AnimalsView.vue";
import ClientsView from "@/views/ClientsView.vue";
import LoginView from "@/views/AuthPages/LoginView.vue";
import RegisterView from "@/views/AuthPages/RegisterView.vue";
import PasswordRecoveryView from "@/views/AuthPages/PasswordRecoveryView.vue";
import AuthLayout from "@/views/AuthPages/AuthLayout.vue";
import { useUserStore } from "@/stores/userStore";
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "layout",
            component: Layout,
            meta: { requiresAuth: true },
            children: [
                {
                    path: "",
                    name: "home",
                    component: HomeView,
                },
                {
                    path: "clients",
                    name: "clients",
                    component: ClientsView,
                },
                {
                    path: "animals",
                    name: "animals",
                    component: AnimalsView,
                },
            ],
        },
        {
            path: "/auth",
            name: "auth-layout",
            component: AuthLayout,
            children: [
                {
                    path: "login",
                    name: "login",
                    component: LoginView,
                },
                {
                    path: "register",
                    name: "register",
                    component: RegisterView,
                },
                {
                    path: "password-recovery",
                    name: "password-recovery",
                    component: PasswordRecoveryView,
                },
            ],
        },
    ],
});

router.beforeEach((to, from, next) => {
    const userStore = useUserStore();

    if (to.meta.requiresAuth && !userStore.isAuthenticated) {
        next("/auth/login");
    } else if (!to.meta.requiresAuth && userStore.isAuthenticated) {
        next(from);
    } else {
        next();
    }
});

export default router;
