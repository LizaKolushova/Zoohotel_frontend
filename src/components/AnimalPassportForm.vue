<template>
    <el-form
        ref="passportForm"
        :model="form"
        label-position="top"
        :rules="rules"
        size="large"
        class="form"
    >
        <div class="columns-container">
            <div class="column">
                <el-form-item
                    label="Дата последнего визита"
                    prop="last_vet_visit"
                >
                    <el-date-picker
                        value-format="YYYY-MM-DD"
                        v-model="form.last_vet_visit"
                        type="date"
                        placeholder="Дата последнего визита"
                    />
                </el-form-item>

                <el-form-item
                    label="Номер телефона ветврача"
                    prop="vet_contacts"
                    required
                >
                    <el-input
                        v-model="form.vet_contacts"
                        @input="formatPhone"
                        maxlength="15"
                        placeholder="(***) ***-**-**"
                        ><template #prepend>+7</template></el-input
                    >
                </el-form-item>

                <el-form-item label="Причина посещения" prop="vet_visit_reason">
                    <el-input
                        v-model="form.vet_visit_reason"
                        placeholder="Введите причину посещения"
                    ></el-input>
                </el-form-item>

                <el-form-item
                    label="Хронические заболевания"
                    prop="chronic_diseases"
                >
                    <el-input
                        v-model="form.chronic_diseases"
                        type="textarea"
                        placeholder="Описание хронических заболеваний..."
                        :rows="4"
                    ></el-input>
                </el-form-item>
            </div>

            <div class="column">
                <el-form-item
                    label="Перенесенные заболевания"
                    prop="past_diseases"
                >
                    <el-input
                        v-model="form.past_diseases"
                        type="textarea"
                        placeholder="Описание перенесенных заболеваний..."
                        :rows="4"
                    ></el-input>
                </el-form-item>

                <el-form-item label="Состояние здоровья" prop="health_features">
                    <el-input
                        v-model="form.health_features"
                        type="textarea"
                        placeholder="Особенности состояния здоровья..."
                        :rows="4"
                    ></el-input>
                </el-form-item>
            </div>
        </div>
    </el-form>
    <div class="buttons">
        <el-button type="primary" @click="onSubmit(passportFormRef)">
            Сохранить
        </el-button>
        <el-button @click="$router.back()">Отмена</el-button>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, useTemplateRef } from "vue";
import { useRoute } from "vue-router";
import { useApi } from "@/composables/useApi";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import type { AnimalPassport } from "@/types/types";
import validationRules from "@/views/AuthPages/validationRules";

const emit = defineEmits(["complete"]);
const props = defineProps({
    isEditing: Boolean,
    animalId: Number,
});

const route = useRoute();
const passportFormRef = useTemplateRef<FormInstance>("passportForm");

const form = ref<AnimalPassport>({
    id: 0,
    animal_id: 0,
    last_vet_visit: "",
    vet_contacts: "",
    vet_visit_reason: "",
    chronic_diseases: "",
    past_diseases: "",
    health_features: "",
});

const formatPhone = () => {
    let digits = form.value.vet_contacts.replace(/[^\d]/g, ""); // Удаляем все, кроме цифр

    // Автоматическое форматирование
    if (digits.length === 0) {
        form.value.vet_contacts = "";
    } else if (digits.length <= 3) {
        form.value.vet_contacts = `(${digits}`;
    } else if (digits.length <= 6) {
        form.value.vet_contacts = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else if (digits.length <= 8) {
        form.value.vet_contacts = `(${digits.slice(0, 3)}) ${digits.slice(
            3,
            6
        )}-${digits.slice(6)}`;
    } else {
        form.value.vet_contacts = `(${digits.slice(0, 3)}) ${digits.slice(
            3,
            6
        )}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`;
    }
};

const rules = reactive<FormRules>({
    last_vet_visit: [
        {
            required: true,
            message: "Укажите дату последнего визита",
            trigger: "change",
        },
    ],
    vet_contacts: validationRules.phone,
    vet_visit_reason: [
        {
            required: true,
            message: "Укажите причину посещения",
            trigger: "blur",
        },
    ],
});

async function onSubmit(formEl: FormInstance | null) {
    if (!formEl) return;
    await formEl.validate(async (valid, fields) => {
        if (valid) {
            try {
                form.value.vet_contacts =
                    "+7 " +
                    form.value.vet_contacts.slice(1, 4) +
                    " " +
                    form.value.vet_contacts.slice(6, 9) +
                    " " +
                    form.value.vet_contacts.slice(10, 12) +
                    form.value.vet_contacts.slice(13, 15);
                const animalId = props.animalId || route.params.id;
                const endpoint = `/animal_passports`;
                const method = "post";

                form.value.animal_id = Number(animalId);

                const response = await useApi<{ message: string }>(endpoint, {
                    method: method,
                    data: form.value,
                });

                emit("complete");

                ElMessage({
                    type: "success",
                    message:
                        response.data.message ||
                        "Паспорт животного успешно сохранен",
                    offset: 48,
                });

                if (!props.isEditing) {
                    // Сбросить форму после добавления
                    formEl.resetFields();
                }
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

onMounted(async () => {
    const animalId = props.animalId || route.params.id;
    form.value.animal_id = Number(animalId);

    // Если режим редактирования, загружаем данные паспорта животного
    if (props.isEditing) {
        try {
            const response = await useApi<AnimalPassport>(
                `/animals/${animalId}/passport`
            );
            form.value = response.data;
            form.value.vet_contacts = form.value.vet_contacts.slice(3);
            formatPhone();
        } catch (error) {
            ElMessage({
                type: "error",
                message: "Не удалось загрузить данные паспорта животного",
                offset: 48,
            });
        }
    }
});
</script>

<style lang="scss" scoped>
.form {
    margin-top: 12px;
}

h3 {
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 18px;
    font-weight: 500;
}

.columns-container {
    display: flex;
    flex-wrap: wrap;
    column-gap: 50px;
}

.column {
    width: 100%;
    max-width: 350px;
}

.buttons {
    margin-top: 20px;
}
</style>
