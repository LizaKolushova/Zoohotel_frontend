<template>
    <div>
        <h2 class="page-header">
            {{ isEditing ? "Редактирование клиента" : "Добавление клиента" }}
        </h2>
        <el-form
            ref="clientForm"
            :rules="rules"
            :model="form"
            label-position="top"
            label-width="120px"
            size="large"
        >
            <el-form-item label="Фамилия" prop="last_name">
                <el-input v-model="form.last_name" />
            </el-form-item>
            <el-form-item label="Имя" prop="first_name">
                <el-input v-model="form.first_name" />
            </el-form-item>
            <el-form-item label="Отчество" prop="middle_name">
                <el-input v-model="form.middle_name" />
            </el-form-item>
            <el-form-item label="Телефон" prop="phone">
                <el-input
                    v-model="form.phone"
                    @input="formatPhone"
                    maxlength="15"
                    placeholder="(***) ***-**-**"
                    ><template #prepend>+7</template></el-input
                >
            </el-form-item>
            <el-form-item label="Email" prop="email">
                <el-input v-model="form.email" />
            </el-form-item>
            <div class="buttons">
                <el-button type="primary" @click="onSubmit(clientFormRef)">
                    {{ isEditing ? "Сохранить" : "Добавить" }}
                </el-button>
                <el-button @click="$router.back()">Отмена</el-button>
            </div>
        </el-form>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, useTemplateRef } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useApi } from "@/composables/useApi";
import type { Client } from "@/types/types";
import validationRules from "./AuthPages/validationRules";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";

const route = useRoute();
const router = useRouter();

const isEditing = ref(!!route.params.id);
const clientFormRef = useTemplateRef<FormInstance>("clientForm");

interface clientForm {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
}

const rules = reactive<FormRules<clientForm>>({
    first_name: validationRules.firstName,
    last_name: validationRules.lastName,
    phone: validationRules.phone,
    email: validationRules.email,
});

const form = ref<Client>({
    id: 0,
    last_name: "",
    first_name: "",
    middle_name: "",
    phone: "",
    email: "",
});

const formatPhone = () => {
    let digits = form.value.phone.replace(/[^\d]/g, ""); // Удаляем все, кроме цифр

    // Автоматическое форматирование
    if (digits.length === 0) {
        form.value.phone = "";
    } else if (digits.length <= 3) {
        form.value.phone = `(${digits}`;
    } else if (digits.length <= 6) {
        form.value.phone = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else if (digits.length <= 8) {
        form.value.phone = `(${digits.slice(0, 3)}) ${digits.slice(
            3,
            6
        )}-${digits.slice(6)}`;
    } else {
        form.value.phone = `(${digits.slice(0, 3)}) ${digits.slice(
            3,
            6
        )}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`;
    }
};

onMounted(async () => {
    if (isEditing.value) {
        const response = await useApi<Client>(`/clients/${route.params.id}`);
        form.value = response.data;
        console.log(form.value);
        form.value.phone = form.value.phone.slice(3);
        formatPhone();
    }
});

async function onSubmit(formEl: FormInstance | null) {
    if (!formEl) return;
    await formEl.validate(async (valid, fields) => {
        if (valid) {
            form.value.phone =
                "+7 " +
                form.value.phone.slice(1, 4) +
                " " +
                form.value.phone.slice(6, 9) +
                " " +
                form.value.phone.slice(10, 12) +
                form.value.phone.slice(13, 15);
            const response = await useApi<{ message: string }>("/clients", {
                method: "post",
                data: form.value,
            });
            router.push("/clients");
            ElMessage({
                type: "success",
                message: response.data.message,
                offset: 48,
            });
        } else {
        }
    });
}
</script>

<style scoped>
.buttons {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
}
</style>
