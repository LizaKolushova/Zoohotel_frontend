import { createRouter, createWebHistory } from "vue-router";
import Layout from "@/views/Layout.vue";
import AnimalsView from "@/views/AnimalsView.vue";
import ClientsView from "@/views/ClientsView.vue";
import LoginView from "@/views/AuthPages/LoginView.vue";
import RegisterView from "@/views/AuthPages/RegisterView.vue";
import PasswordRecoveryView from "@/views/AuthPages/PasswordRecoveryView.vue";
import AuthLayout from "@/views/AuthPages/AuthLayout.vue";
import { useUserStore } from "@/stores/userStore";
import GhanttChart from "@/views/GhanttChart.vue";
import BookingsView from "@/views/BookingsView.vue";
import ClientFormView from "@/views/ClientFormView.vue";
import AnimalFormView from "@/views/AnimalFormView.vue";
import ClientPage from "@/views/ClientPage.vue";
import AnimalPage from "@/views/AnimalPage.vue";
import AnimalPassportViewForm from "@/views/AnimalPassportViewForm.vue";
import BookingStepClient from "@/components/BookingStepClient.vue";
import BookingsCreateView from "@/views/BookingsCreateView.vue";
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
                    name: "ghantt",
                    component: GhanttChart,
                },
                {
                    path: "/clients",
                    children: [
                        {
                            path: "",
                            name: "clients",
                            component: ClientsView,
                        },
                        {
                            path: ":id/edit",
                            component: ClientFormView,
                            props: true,
                        },
                        {
                            path: ":id",
                            component: ClientPage,
                        },

                        {
                            path: "create",
                            component: ClientFormView,
                        },
                    ],
                },
                {
                    path: "/animals",
                    children: [
                        {
                            path: "",
                            name: "animals",
                            component: AnimalsView,
                        },
                        {
                            path: "create",
                            name: "animal-create",
                            component: AnimalFormView,
                            props: true,
                        },
                        {
                            path: ":id",
                            component: AnimalPage,
                        },
                        {
                            path: ":id/edit",
                            component: AnimalFormView,
                            props: true,
                        },
                        {
                            path: ":id/passport",
                            name: "animal-passport",
                            component: AnimalPassportViewForm,
                        },
                    ],
                },

                {
                    path: "bookings",
                    children: [
                        {
                            path: "",
                            name: "bookings",
                            component: BookingsView,
                        },
                        {
                            path: "create",
                            component: BookingsCreateView,
                        },
                        {
                            path: ":id/edit",
                            component: BookingsCreateView,
                        },
                    ],
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
