<template>
    <div class="form-container">
        <el-form
            :model="form"
            :rules="rules"
            ref="vaccinationFormRef"
            label-position="top"
            ><el-form-item label="Дата прививки" prop="vaccination_date"
                ><el-date-picker
                    class="date-input"
                    size="large"
                    v-model="form.vaccination_date"
                    value-format="YYYY-MM-DD"
                ></el-date-picker
            ></el-form-item>
            <el-form-item label="Название прививки" prop="vaccination_name"
                ><el-input
                    size="large"
                    v-model="form.vaccination_name"
                ></el-input
            ></el-form-item>
        </el-form>
        <div class="buttons-container">
            <el-button
                type="primary"
                @click="sendVaccinationData(vaccinationFormRef)"
                >Сохранить</el-button
            >
            <el-button @click="emit('cancel')">Отмена</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useApi } from "@/composables/useApi";
import type { Vaccination } from "@/types/types";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { reactive, ref, useTemplateRef, watch, type PropType } from "vue";
const props = defineProps({
    formData: {
        type: Object as PropType<Vaccination>,
        required: true,
    },
});
const emit = defineEmits(["complete", "cancel"]);
const vaccinationFormRef = useTemplateRef<FormInstance>("vaccinationFormRef");
const form = ref<Vaccination>({ ...props.formData });
const rules = reactive<FormRules>({
    vaccination_name: {
        required: true,
        message: "Введите названеие прививки",
        trigger: "blur",
    },
    vaccination_date: {
        required: true,
        message: "Введите дату прививки",
        trigger: "blur",
    },
});

watch(
    () => props.formData,
    (newVal) => {
        // Обновляем все поля формы при изменении props.formData
        form.value = newVal;
    },
    { deep: true }
);

async function sendVaccinationData(formEl: FormInstance | null) {
    if (!formEl) return;
    await formEl.validate(async (valid, fields) => {
        if (valid) {
            console.log(form.value.vaccination_date);
            try {
                const endpoint = "/vaccinations";
                const method = "post";
                const response = await useApi<{ message: string }>(endpoint, {
                    method: method,
                    data: form.value,
                });
                emit("complete");
                if (response.error) {
                    throw new Error(response.data.message);
                }
                ElMessage({
                    type: "success",
                    message:
                        response.data.message ||
                        (form.value.id
                            ? "Прививка успешно добавлена"
                            : "Прививка успешно Отредактирована"),
                    offset: 48,
                });
                formEl.resetFields();
            } catch (error) {
                ElMessage({
                    type: "error",
                    message: "Произошла ошибка при сохранении данных",
                    offset: 48,
                });
            }
        }
    });
}
</script>

<style lang="scss" scoped>
.form-container {
    max-width: 500px;
}
.date-input {
    --el-date-editor-width: 100%;
}
.buttons-container {
    margin-left: auto;
    width: fit-content;
}
</style>
