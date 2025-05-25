<template>
    <div class="form-container">
        <el-form
            :model="form"
            :rules="rules"
            ref="medicalRecordFormRef"
            label-position="top"
        >
            <el-form-item label="Дата" prop="date">
                <el-date-picker
                    class="date-input"
                    size="large"
                    v-model="form.date"
                    value-format="YYYY-MM-DD"
                ></el-date-picker>
            </el-form-item>
            <el-form-item label="Диагноз" prop="diagnosis">
                <el-input size="large" v-model="form.diagnosis"></el-input>
            </el-form-item>
            <el-form-item label="Лечение" prop="treatment">
                <el-input
                    type="textarea"
                    :rows="3"
                    size="large"
                    v-model="form.treatment"
                ></el-input>
            </el-form-item>
            <el-form-item label="Назначения" prop="prescriptions">
                <el-input
                    type="textarea"
                    :rows="3"
                    size="large"
                    v-model="form.prescriptions"
                ></el-input>
            </el-form-item>
            <el-form-item label="Заметки" prop="notes">
                <el-input
                    type="textarea"
                    :rows="3"
                    size="large"
                    v-model="form.notes"
                ></el-input>
            </el-form-item>
        </el-form>
        <div class="buttons-container">
            <el-button
                type="primary"
                @click="sendMedicalRecordData(medicalRecordFormRef)"
                >Сохранить</el-button
            >
            <el-button @click="emit('cancel')">Отмена</el-button>
        </div>
    </div>
</template>
<script setup lang="ts">
import { useApi } from "@/composables/useApi";
import type { MedicalRecord } from "@/types/types";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { reactive, watch, useTemplateRef, type PropType, ref } from "vue";

const props = defineProps({
    formData: {
        type: Object as PropType<MedicalRecord>,
        required: true,
    },
});

const emit = defineEmits(["complete", "cancel"]);
const medicalRecordFormRef = useTemplateRef<FormInstance>(
    "medicalRecordFormRef"
);

// Используем реактивную копию данных из props
const form = ref<MedicalRecord>({ ...props.formData });

// Наблюдаем за изменениями в props.formData и обновляем форму
watch(
    () => props.formData,
    (newVal) => {
        // Обновляем все поля формы при изменении props.formData
        form.value = newVal;
    },
    { deep: true }
);

const rules = reactive<FormRules>({
    date: {
        required: true,
        message: "Введите дату",
        trigger: "blur",
    },
});

async function sendMedicalRecordData(formEl: FormInstance | null) {
    if (!formEl) return;
    await formEl.validate(async (valid, fields) => {
        if (valid) {
            try {
                const endpoint = "/medical_records";
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
                            ? "Медицинская запись успешно отредактирована"
                            : "Медицинская запись успешно добавлена"),
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
