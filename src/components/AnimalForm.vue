<template>
    <el-form
        ref="animalForm"
        :model="form"
        label-position="top"
        :rules="rules"
        size="large"
        class="form"
    >
        <div class="columns-container">
            <div class="column">
                <el-form-item label="Кличка" prop="name">
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="Хозяин" prop="client_id">
                    <el-select
                        v-model="form.client_id"
                        filterable
                        remote
                        placeholder="Поиск хозяина по ФИО"
                        :loading="clientsLoading"
                    >
                        <el-option
                            v-for="client in clientsData"
                            :key="client.id"
                            :label="getFullName(client)"
                            :value="client.id"
                        >
                            {{ getFullName(client) }}
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="Тип животного" prop="animal_type_id">
                    <el-select v-model="form.animal_type_id">
                        <el-option
                            v-for="animal_type in animalTypesData"
                            :value="animal_type.id"
                            :label="animal_type.name"
                            :key="animal_type.id"
                        >
                            {{ animal_type.name }}
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="Порода" prop="breed">
                    <el-input v-model="form.breed"></el-input>
                </el-form-item>
                <el-form-item label="Пол" prop="gender">
                    <el-radio-group v-model="form.gender">
                        <el-radio value="male">М</el-radio>
                        <el-radio value="female">Ж</el-radio>
                    </el-radio-group>
                </el-form-item>
            </div>
            <div class="column">
                <el-form-item label="Вес" prop="weight">
                    <el-input v-model="form.weight"> </el-input>
                </el-form-item>
                <el-form-item label="Окрас" prop="color">
                    <el-input v-model="form.color"> </el-input>
                </el-form-item>
                <el-form-item label="Дата рождения" prop="birth_date">
                    <el-date-picker
                        value-format="YYYY-MM-DD"
                        v-model="form.birth_date"
                        type="date"
                        placeholder="Дата рождения"
                    />
                </el-form-item>
                <el-form-item label="Стерилизовано" prop="sterilized">
                    <el-radio-group v-model="form.sterilized">
                        <el-radio :value="true">Да</el-radio>
                        <el-radio :value="false">Нет</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="Особенности" prop="description">
                    <el-input v-model="form.description" type="textarea">
                    </el-input>
                </el-form-item>
            </div>
        </div>
    </el-form>
    <div class="buttons">
        <el-button size="large" type="primary" @click="onSubmit(animalFormRef)">
            {{ props.isEditing ? "Сохранить" : "Добавить" }}
        </el-button>
        <el-button size="large" @click="emit('cancel')">Отмена</el-button>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, useTemplateRef } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useApi } from "@/composables/useApi";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import type { Client, AnimalType } from "@/types/types";
const emit = defineEmits(["complete", "cancel"]);
const props = defineProps({
    isEditing: Boolean,
    animalId: Number,
    clientId: Number,
});

const route = useRoute();
const animalFormRef = useTemplateRef<FormInstance>("animalForm");

// Типы животных - предполагаем, что они загружаются из API
const animalTypesData = ref<AnimalType[]>([]);
const clientsData = ref<Client[]>([]);
const clientsLoading = ref(false);

interface AnimalForm {
    id: number;
    name: string;
    animal_type_id: number;
    client_id: number | null;
    breed: string;
    gender: string;
    weight: string | number;
    color: string;
    birth_date: string;
    sterilized: boolean;
    description: string;
}

const form = ref<AnimalForm>({
    id: 0,
    name: "",
    animal_type_id: 1,
    client_id: props.clientId || null,
    breed: "",
    gender: "male",
    weight: "",
    color: "",
    birth_date: "",
    sterilized: false,
    description: "",
});

// Функция для получения полного имени клиента
const getFullName = (client: Client): string => {
    return `${client.last_name} ${client.first_name} ${
        client.middle_name || ""
    }`.trim();
};

// Поиск клиентов по ФИО

// Загрузка всех клиентов
async function loadClients() {
    clientsLoading.value = true;
    try {
        const response = await useApi<Client[]>("/clients");
        clientsData.value = response.data;
    } catch (error) {
        ElMessage({
            type: "error",
            message: "Не удалось загрузить список клиентов",
            offset: 48,
        });
    } finally {
        clientsLoading.value = false;
    }
}

// Правила валидации
const rules = reactive<FormRules>({
    name: [
        {
            required: true,
            message: "Кличка животного обязательна",
            trigger: "blur",
        },
        {
            min: 2,
            max: 50,
            message: "Длина клички должна быть от 2 до 50 символов",
            trigger: "blur",
        },
    ],
    client_id: [
        {
            required: true,
            message: "Выберите хозяина животного",
            trigger: "change",
        },
    ],
    animal_type_id: [
        {
            required: true,
            message: "Выберите тип животного",
            trigger: "change",
        },
    ],
    breed: [{ required: true, message: "Порода обязательна", trigger: "blur" }],
    gender: [
        {
            required: true,
            message: "Выберите пол животного",
            trigger: "change",
        },
    ],
    weight: [
        { required: true, message: "Укажите вес животного", trigger: "blur" },
        {
            pattern: /^[0-9]+(.[0-9]+)?$/,
            message: "Вес должен быть числом",
            trigger: "blur",
        },
    ],
    birth_date: [
        { required: true, message: "Укажите дату рождения", trigger: "change" },
    ],
    sterilized: [
        { required: true, message: "Обязательно поле", trigger: "change" },
    ],
});

async function onSubmit(formEl: FormInstance | null) {
    if (!formEl) return;
    await formEl.validate(async (valid, fields) => {
        if (valid) {
            try {
                const endpoint = "/animals";

                const method = "post";

                const response = await useApi<{
                    message: string;
                    animal_id: number;
                }>(endpoint, {
                    method: method,
                    data: form.value,
                });

                emit("complete", response.data.animal_id);

                ElMessage({
                    type: "success",
                    message:
                        response.data.message ||
                        (props.isEditing
                            ? "Животное успешно обновлено"
                            : "Животное успешно добавлено"),
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

// Загрузка типов животных
async function loadAnimalTypes() {
    try {
        const response = await useApi<AnimalType[]>("/animal_types");
        animalTypesData.value = response.data;
    } catch (error) {
        ElMessage({
            type: "error",
            message: "Не удалось загрузить типы животных",
            offset: 48,
        });
    }
}

onMounted(async () => {
    // Загружаем типы животных и клиентов при монтировании компонента
    await Promise.all([loadAnimalTypes(), loadClients()]);
    if (route.params.id) {
        form.value.id = +route.params.id;
    }
    // Если режим редактирования, загружаем данные животного
    if (props.isEditing) {
        try {
            const response = await useApi<AnimalForm>(
                `/animals/${props.animalId}`
            );
            form.value = response.data;
        } catch (error) {
            ElMessage({
                type: "error",
                message: "Не удалось загрузить данные животного",
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

.el-radio-group {
    display: flex;
    gap: 16px;
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
</style>
