<template>
    <h2 class="page-header page-header_auth">Регистрация</h2>
    <el-form
        ref="form"
        :model="registerForm"
        class="auth-form"
        label-position="top"
        :rules="rules"
    >
        <el-form-item label="Фамилия" prop="lastName">
            <el-input
                v-model="registerForm.lastName"
                type="text"
                placeholder="Введите фамилию"
            ></el-input>
        </el-form-item>
        <el-form-item label="Имя" prop="firstName">
            <el-input
                type="text"
                v-model="registerForm.firstName"
                placeholder="Введите имя"
            ></el-input>
        </el-form-item>
        <el-form-item label="Отчество" prop="patronymic">
            <el-input
                type="text"
                v-model="registerForm.patronymic"
                placeholder="Введите отчество"
            ></el-input>
        </el-form-item>
        <el-form-item label="Логин" prop="login">
            <el-input
                v-model="registerForm.login"
                type="text"
                placeholder="Введите логин"
            ></el-input>
        </el-form-item>
        <el-form-item label="Номер Телефона" prop="phone">
            <el-input
                v-model="registerForm.phone"
                type="tel"
                @input="formatPhone"
                maxlength="15"
                placeholder="(999) 999-99-99"
                ><template #prepend>+7</template></el-input
            >
        </el-form-item>
        <el-form-item label="Электронная почта" prop="email">
            <el-input
                v-model="registerForm.email"
                type="email"
                placeholder="Введите email"
            ></el-input>
        </el-form-item>
        <el-form-item label="Пароль" prop="password">
            <el-input
                type="password"
                v-model="registerForm.password"
                placeholder="Введите пароль"
            ></el-input>
        </el-form-item>
        <el-form-item
            label="Подтвердите пароль"
            prop="password_confirm"
            required
        >
            <el-input
                type="password"
                v-model="registerForm.password_confirm"
                placeholder="Введите пароль"
            ></el-input>
        </el-form-item>
        <div class="form-links">
            <el-button tag="RouterLink" link to="/auth/login" type="primary"
                >Есть аккаунт? Войти</el-button
            >
        </div>
        <el-button
            type="primary"
            @click="onSubmit(registerFormRef)"
            class="button-submit"
            >Войти</el-button
        >
    </el-form>
</template>

<script setup lang="ts">
import router from "@/router";
import { reactive, useTemplateRef } from "vue";
import validationRules from "./validationRules";
import { type FormRules, type FormInstance, ElMessage } from "element-plus";

interface RegisterForm {
    firstName: string;
    lastName: string;
    patronymic: string;
    login: string;
    phone: string;
    email: string;
    password: string;
    password_confirm: string;
}

const registerFormRef = useTemplateRef<FormInstance>("form");
const registerForm = reactive<RegisterForm>({
    firstName: "",
    lastName: "",
    patronymic: "",
    login: "",
    phone: "",
    email: "",
    password: "",
    password_confirm: "",
});
const validatePass = (rule: any, value: any, callback: any) => {
    if (value !== registerForm.password) {
        callback(new Error("Пароли не совпадают"));
    } else {
        callback();
    }
};

const rules = reactive<FormRules<RegisterForm>>({
    firstName: validationRules.firstName,
    lastName: validationRules.lastName,
    login: validationRules.login,
    phone: validationRules.phone,
    email: validationRules.email,
    password: validationRules.password,
    password_confirm: [
        { required: true, message: "Введите пароль" },
        {
            validator: validatePass,
            trigger: "blur",
        },
    ],
});

async function onSubmit(formEl: FormInstance | null) {
    if (!formEl) return;
    await formEl.validate((valid, fields) => {
        if (valid) {
            router.push("/auth/login");
            ElMessage({
                type: "success",
                message: "Регистрация прошла успешно",
                offset: 48,
            });
        } else {
        }
    });
}

const formatPhone = () => {
    let digits = registerForm.phone.replace(/[^\d]/g, ""); // Удаляем все, кроме цифр

    // Автоматическое форматирование
    if (digits.length === 0) {
        registerForm.phone = "";
    } else if (digits.length <= 3) {
        registerForm.phone = `(${digits}`;
    } else if (digits.length <= 6) {
        registerForm.phone = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else if (digits.length <= 8) {
        registerForm.phone = `(${digits.slice(0, 3)}) ${digits.slice(
            3,
            6
        )}-${digits.slice(6)}`;
    } else {
        registerForm.phone = `(${digits.slice(0, 3)}) ${digits.slice(
            3,
            6
        )}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`;
    }
};
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
