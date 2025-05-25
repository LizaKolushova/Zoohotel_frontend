<template>
    <h2 class="page-header page-header_auth">Восстановление пароля</h2>
    <el-form
        ref="form"
        :model="passwordRecoveryForm"
        class="auth-form"
        label-position="top"
        :rules="rules"
    >
        <el-form-item label="Электронная почта" prop="email">
            <el-input
                v-model="passwordRecoveryForm.email"
                type="email"
                placeholder="Введите email"
            ></el-input>
        </el-form-item>

        <el-button
            type="primary"
            @click="onSubmit(passwordRecoveryFormRef)"
            class="button-submit"
            >Войти</el-button
        >
    </el-form>
</template>

<script setup lang="ts">
import router from "@/router";
import { ElMessage } from "element-plus";
import { reactive, useTemplateRef } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import validationRules from "./validationRules";

interface PasswordRecoveryForm {
    email: string;
}

const passwordRecoveryFormRef = useTemplateRef<FormInstance>("form");
const passwordRecoveryForm = reactive<PasswordRecoveryForm>({
    email: "",
});

const rules = reactive<FormRules<PasswordRecoveryForm>>({
    email: validationRules.email,
});
async function onSubmit(formEl: FormInstance | null) {
    if (!formEl) return;
    await formEl.validate((valid, fields) => {
        if (valid) {
            router.push("/auth/login");
            ElMessage({
                type: "success",
                message: "Инструкции отправлены на почту",
                offset: 48,
            });
        } else {
        }
    });
}
</script>

<style lang="scss" scoped>
.button-submit {
    display: block;
    margin-left: auto;
    margin-top: 20px;
}
</style>
