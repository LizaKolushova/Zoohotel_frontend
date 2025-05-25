<template>
    <div class="form-container">
        <el-form
            :model="form"
            :rules="rules"
            ref="treatmentFormRef"
            label-position="top"
        >
            <el-form-item label="Дата обработки" prop="treatment_date">
                <el-date-picker
                    class="date-input"
                    size="large"
                    v-model="form.treatment_date"
                    value-format="YYYY-MM-DD"
                ></el-date-picker>
            </el-form-item>
            <el-form-item label="Тип обработки" prop="treatment_type">
                <el-input size="large" v-model="form.treatment_type"></el-input>
            </el-form-item>
            <el-form-item label="Описание" prop="description">
                <el-input
                    type="textarea"
                    size="large"
                    v-model="form.description"
                    :rows="3"
                ></el-input>
            </el-form-item>
        </el-form>
        <div class="buttons-container">
            <el-button
                type="primary"
                @click="sendTreatmentData(treatmentFormRef)"
                >Сохранить</el-button
            >
            <el-button @click="emit('cancel')">Отмена</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useApi } from "@/composables/useApi";
import type { Treatment } from "@/types/types";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { reactive, ref, useTemplateRef, watch, type PropType } from "vue";

const props = defineProps({
    formData: {
        type: Object as PropType<Treatment>,
        required: true,
    },
});

const emit = defineEmits(["complete", "cancel"]);
const treatmentFormRef = useTemplateRef<FormInstance>("treatmentFormRef");
const form = ref<Treatment>({ ...props.formData });

const rules = reactive<FormRules>({
    treatment_type: {
        required: true,
        message: "Введите тип обработки",
        trigger: "blur",
    },
    treatment_date: {
        required: true,
        message: "Введите дату обработки",
        trigger: "blur",
    },
    description: {
        required: false,
    },
});

watch(
    () => props.formData,
    (newVal) => {
        form.value = newVal;
    },
    { deep: true }
);

async function sendTreatmentData(formEl: FormInstance | null) {
    if (!formEl) return;
    await formEl.validate(async (valid, fields) => {
        if (valid) {
            try {
                const endpoint = "/treatments";
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
                            ? "Обработка успешно отредактирована"
                            : "Обработка успешно добавлена"),
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
