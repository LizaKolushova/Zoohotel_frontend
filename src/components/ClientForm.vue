<template>
    <el-form
        ref="clientForm"
        :rules="rules"
        :model="form"
        label-position="top"
        label-width="120px"
        size="large"
        class="form"
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
                {{ props.isEditing ? "Сохранить" : "Добавить" }}
            </el-button>
            <el-button @click="emit('cancel')">Отмена</el-button>
        </div>
    </el-form>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, useTemplateRef } from "vue";
import { useRoute } from "vue-router";
import { useApi } from "@/composables/useApi";
import type { Client } from "@/types/types";
import validationRules from "@/views/AuthPages/validationRules";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";

const emit = defineEmits(["complete", "cancel"]);
const props = defineProps({
    isEditing: Boolean,
    clientId: Number,
});
const clientFormRef = useTemplateRef<FormInstance>("clientForm");

interface clientForm {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
}

const form = ref<Client>({
    id: 0,
    last_name: "",
    first_name: "",
    middle_name: "",
    phone: "",
    email: "",
});

const rules = reactive<FormRules<clientForm>>({
    first_name: validationRules.firstName,
    last_name: validationRules.lastName,
    phone: validationRules.phone,
    email: validationRules.email,
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
            const response = await useApi<{
                message: string;
                client_id: number;
            }>("/clients", {
                method: "post",
                data: form.value,
            });

            emit("complete", response.data.client_id);
            ElMessage({
                type: "success",
                message: response.data.message,
                offset: 48,
            });
        } else {
        }
    });
}

onMounted(async () => {
    if (props.isEditing) {
        const response = await useApi<Client>(`/clients/${props.clientId}`);
        form.value = response.data;
        form.value.phone = form.value.phone.slice(3);
        formatPhone();
    }
});
</script>

<style lang="scss" scoped>
.form {
    max-width: 500px;
    margin-top: 12px;
}
</style>
