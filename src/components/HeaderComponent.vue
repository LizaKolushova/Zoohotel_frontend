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
                <el-menu
                    v-if="isAuthenticated"
                    class="navigation-menu"
                    mode="horizontal"
                    :default-active="$route.path"
                    router
                >
                    <el-menu-item index="/">Главная</el-menu-item>
                    <el-menu-item index="/clients">Клиенты</el-menu-item>
                    <el-menu-item index="/animals">Животные</el-menu-item>
                </el-menu>

                <div class="account-container">
                    <template v-if="isAuthenticated">
                        <Bell class="notification-icon"></Bell>
                        <span class="admin-role" v-if="isAdmin"
                            >Администратор</span
                        >
                        <el-button
                            class="logout-button"
                            plain
                            @click="handleLogout()"
                            >Выход</el-button
                        >
                        <!--Контент, который появляется, если пользователь авторизован -->
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
                        <!--Контент, который появляется, если пользователь не авторизован --></template
                    >
                </div>
            </div>
        </div>
    </el-header>
</template>

<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/userStore";

const { isAdmin, login, logout, isAuthenticated } = useUserStore();

function handleLogout() {
    logout();
    router.push("/auth/login");
}
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
}

.register-link {
    margin-left: 0;
}
</style>
