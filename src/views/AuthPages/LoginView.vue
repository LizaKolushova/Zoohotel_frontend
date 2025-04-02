<template>
    <h2 class="page-header page-header_auth">Вход</h2>
    <el-form
        ref="form"
        :model="loginForm"
        class="auth-form"
        label-position="top"
        :rules="rules"
    >
        <el-form-item label="Логин" prop="login">
            <el-input
                v-model="loginForm.login"
                type="text"
                placeholder="Введите логин"
            ></el-input>
        </el-form-item>
        <el-form-item label="Пароль" prop="password">
            <el-input
                type="password"
                v-model="loginForm.password"
                placeholder="Введите пароль"
            ></el-input>
        </el-form-item>
        <div class="form-links">
            <el-button
                tag="RouterLink"
                link
                to="/auth/password-recovery"
                type="primary"
                >Забыли пароль?</el-button
            >
            <el-button tag="RouterLink" link to="/auth/register" type="primary"
                >Регистрация</el-button
            >
        </div>
        <el-button
            type="primary"
            @click="onSubmit(loginFormRef, 'admin')"
            class="button-submit"
            >Войти</el-button
        >
    </el-form>
</template>

<script setup lang="ts">
import { useUserStore } from "@/stores/userStore";
import { reactive, useTemplateRef } from "vue";
import { type FormRules, type FormInstance, ElMessage } from "element-plus";
import router from "@/router";

interface LoginForm {
    login: string;
    password: string;
}

const loginFormRef = useTemplateRef<FormInstance>("form");
const { login } = useUserStore();
const loginForm = reactive<LoginForm>({
    login: "",
    password: "",
});

const rules = reactive<FormRules<LoginForm>>({
    login: [
        {
            required: true,
            message: "Введите логин",
            trigger: "blur",
        },
    ],
    password: [
        {
            required: true,
            message: "Введите пароль",
            trigger: "blur",
        },
    ],
});

async function onSubmit(formEl: FormInstance | null, role: string) {
    if (!formEl) return;
    await formEl.validate((valid, fields) => {
        if (valid) {
            ElMessage({
                type: "success",
                message: "Вы успешно авторизовались",
                offset: 48,
            });
            login("admin");
            router.push("/");
        } else {
        }
    });
}
</script>

<style lang="scss" scoped>
.form-links {
    display: flex;
    justify-content: space-between;

    .el-button {
        --el-button-font-weight: 400;
        text-decoration: underline;
    }
}

.button-submit {
    display: block;
    margin-left: auto;
    margin-top: 20px;
}
</style>
