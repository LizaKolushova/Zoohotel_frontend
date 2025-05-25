<template>
    <el-header class="header">
        <div class="wrapper">
            <div class="header-container">
                <div class="logo-container">
                    <img
                        src="../assets/logo.svg"
                        alt="Zoohotel Logo"
                        class="logo"
                    />
                    <h1 class="app-name">Zoohotel</h1>
                </div>

                <!-- Десктопная версия меню -->
                <el-menu
                    v-if="isAuthenticated && !isMobile"
                    class="navigation-menu"
                    mode="horizontal"
                    :default-active="activeMenu"
                    router
                >
                    <el-menu-item index="/">Календарь</el-menu-item>
                    <el-menu-item index="/bookings">Список броней</el-menu-item>
                    <el-menu-item index="/clients">Клиенты</el-menu-item>
                    <el-menu-item index="/animals">Животные</el-menu-item>
                </el-menu>

                <!-- Бургер иконка для мобильной версии -->
                <div
                    v-if="isAuthenticated && isMobile"
                    class="burger-menu-toggle"
                >
                    <el-button type="text" @click="toggleMobileMenu">
                        <el-icon size="24px"><Menu /></el-icon>
                    </el-button>
                </div>

                <div class="account-container" :class="{ mobile: isMobile }">
                    <template v-if="isAuthenticated">
                        <Bell class="notification-icon"></Bell>
                        <span class="admin-role" v-if="isAdmin && !isMobile"
                            >Администратор</span
                        >
                        <el-button
                            class="logout-button"
                            plain
                            @click="handleLogout()"
                            >Выход</el-button
                        >
                    </template>
                    <template v-if="!isAuthenticated">
                        <el-button
                            tag="RouterLink"
                            to="/auth/login"
                            class="login-link"
                            type="primary"
                            >Вход</el-button
                        >
                        <el-button
                            tag="RouterLink"
                            to="/auth/register"
                            class="register-link"
                            plain
                            >Регистрация</el-button
                        >
                    </template>
                </div>
            </div>
        </div>
    </el-header>

    <!-- Мобильное меню -->
    <el-drawer
        v-model="mobileMenuVisible"
        direction="ltr"
        size="70%"
        :with-header="false"
        class="mobile-menu-drawer"
    >
        <div class="mobile-menu-container">
            <div class="mobile-menu-header">
                <div class="logo-container">
                    <img
                        src="../assets/logo.svg"
                        alt="Zoohotel Logo"
                        class="logo"
                    />
                    <h1 class="app-name">Zoohotel</h1>
                </div>
                <el-button type="text" @click="mobileMenuVisible = false">
                    <el-icon size="24px"><Close /></el-icon>
                </el-button>
            </div>

            <el-menu
                v-if="isAuthenticated"
                class="mobile-navigation-menu"
                mode="vertical"
                :default-active="activeMenu"
                router
                @select="mobileMenuVisible = false"
            >
                <el-menu-item index="/">Календарь</el-menu-item>
                <el-menu-item index="/bookings">Список броней</el-menu-item>
                <el-menu-item index="/clients">Клиенты</el-menu-item>
                <el-menu-item index="/animals">Животные</el-menu-item>
            </el-menu>

            <div class="mobile-menu-footer" v-if="isAuthenticated">
                <span class="admin-role" v-if="isAdmin">Администратор</span>
                <el-button
                    class="logout-button"
                    type="danger"
                    plain
                    @click="
                        handleLogout();
                        mobileMenuVisible = false;
                    "
                    >Выход</el-button
                >
            </div>
        </div>
    </el-drawer>
</template>

<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/userStore";
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { Menu, Close } from "@element-plus/icons-vue";

const { isAdmin, login, logout, isAuthenticated } = useUserStore();
const mobileMenuVisible = ref(false);
const isMobile = ref(false);
const windowWidth = ref(window.innerWidth);

function toggleMobileMenu() {
    mobileMenuVisible.value = !mobileMenuVisible.value;
}

function handleLogout() {
    logout();
    router.push("/auth/login");
}

function handleResize() {
    windowWidth.value = window.innerWidth;
    isMobile.value = windowWidth.value < 924;
}

onMounted(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
    window.removeEventListener("resize", handleResize);
});

const route = useRoute();

const activeMenu = computed(() => {
    const path = route.path;

    if (path.startsWith("/clients")) return "/clients";
    if (path.startsWith("/animals")) return "/animals";
    if (path.startsWith("/bookings")) return "/bookings";
    if (path === "/") return "/";
    return "";
});
</script>

<style lang="scss" scoped>
.header {
    border-bottom: var(--el-border-width) solid var(--el-border-color-light);
    height: 48px;
    padding: 0;
    box-shadow: var(--el-box-shadow-light);
}

.header-container {
    height: 48px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.logo-container {
    display: flex;
    align-items: center;
    gap: 10px;
}

.navigation-menu {
    box-sizing: border-box;
    height: 100%;
    width: 100%;
    justify-content: center;
    --el-menu-border-color: var(--el-border-color-light);
}

.notification-icon {
    width: 20px;
    aspect-ratio: 1;
    transition: all var(--el-transition-duration);
    &:hover {
        cursor: pointer;
        color: var(--el-menu-hover-text-color);
    }
}

.account-container {
    display: flex;
    align-items: center;
    gap: 16px;

    &.mobile {
        gap: 8px;

        .admin-role {
            display: none;
        }
    }
}

.register-link {
    margin-left: 0;
}

.burger-menu-toggle {
    margin-left: auto;
    margin-right: 8px;
}

/* Стили для мобильного меню */

.mobile-menu-container {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.mobile-menu-header {
    padding: 16px 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: var(--el-border-width) solid var(--el-border-color-light);
}

.mobile-navigation-menu {
    flex-grow: 1;
    border-right: none;
}

.mobile-menu-footer {
    padding: 16px 8px;
    border-top: var(--el-border-width) solid var(--el-border-color-light);
    display: flex;
    align-items: center;
    justify-content: space-between;
}

@media (max-width: 767px) {
    .logo-container .app-name {
        font-size: 1.2rem;
    }

    .account-container {
        .el-button {
            padding: 6px 12px;
        }
    }
}
</style>
