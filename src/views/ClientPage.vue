<template>
    <div class="page-header">
        <el-button class="back-button" :icon="Back" @click="router.back()" text>
        </el-button>
        <h2>{{ fullName }}</h2>
    </div>

    <div class="buttons-container">
        <el-button
            tag="router-link"
            :to="`/clients/${clientId}/edit`"
            size="large"
            type="primary"
        >
            Редактировать
        </el-button>
        <el-button
            tag="router-link"
            :to="{ name: 'animal-create', query: { clientId } }"
            size="large"
            >Новое животное</el-button
        >
        <el-input
            class="search"
            prefix-icon="Search"
            clearable
            placeholder="Поиск животного"
            size="large"
            v-model="searchFilter"
        ></el-input>
    </div>

    <div class="columns-container">
        <div class="column">
            <h3 class="column-header">Информация о клиенте</h3>
            <div class="column-content client-info">
                <el-descriptions :column="1" border label-width="140">
                    <el-descriptions-item label="Фамилия">{{
                        client.last_name
                    }}</el-descriptions-item>
                    <el-descriptions-item label="Имя">{{
                        client.first_name
                    }}</el-descriptions-item>
                    <el-descriptions-item label="Отчество">{{
                        client.middle_name
                    }}</el-descriptions-item>
                    <el-descriptions-item label="E-mail">{{
                        client.email
                    }}</el-descriptions-item>
                    <el-descriptions-item label="Телефон">{{
                        client.phone
                    }}</el-descriptions-item>
                </el-descriptions>
            </div>
        </div>
        <div class="column">
            <h3 class="column-header">Питомцы</h3>
            <div class="column-content pets">
                <el-descriptions
                    class="animal-description"
                    v-for="animal in filteredAnimals"
                    :key="animal.id"
                    border
                    :column="1"
                    label-width="140"
                >
                    <template #title>
                        <el-button
                            class="animal-link"
                            link
                            tag="router-link"
                            :to="`/animals/${animal.id}`"
                            >{{ animal.name }}</el-button
                        >
                    </template>
                    <el-descriptions-item label="Тип животного"
                        ><el-tag class="tag">{{
                            getAnimalTypeName(animal.animal_type_id)
                        }}</el-tag></el-descriptions-item
                    >
                    <el-descriptions-item label="Порода">{{
                        animal.breed
                    }}</el-descriptions-item>
                    <el-descriptions-item label="Пол"
                        ><el-tag class="tag">{{
                            animal.gender == "male" ? "М" : "Ж"
                        }}</el-tag></el-descriptions-item
                    >
                    <el-descriptions-item label="Вес, кг">{{
                        animal.weight
                    }}</el-descriptions-item>
                    <el-descriptions-item label="Окрас">{{
                        animal.color
                    }}</el-descriptions-item>
                    <el-descriptions-item label="Дата рождения">{{
                        formatDate(animal.birth_date)
                    }}</el-descriptions-item>
                    <el-descriptions-item label="Стерилизация"
                        ><el-tag class="tag">{{
                            animal.sterilized ? "Да" : "Нет"
                        }}</el-tag></el-descriptions-item
                    >
                </el-descriptions>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Back } from "@element-plus/icons-vue";
import { useApi } from "@/composables/useApi";
import type { Animal, AnimalType, Client } from "@/types/types";
import { ElMessage } from "element-plus";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();
const clientId = ref(+route.params.id);
const client = ref<Client>({
    id: 0,
    last_name: "",
    first_name: "",
    middle_name: "",
    phone: "",
    email: "",
});
const animals = ref<Animal[]>([]);
const animalTypes = ref<AnimalType[]>([]);

const searchFilter = ref("");
const filteredAnimals = computed(() => {
    if (!searchFilter.value) return animals.value;

    const search = searchFilter.value.toLowerCase();
    return animals.value.filter(
        (animal) =>
            animal.name.toLowerCase().includes(search) ||
            animal.breed.toLowerCase().includes(search) ||
            animal.color.toLowerCase().includes(search)
    );
});
const fullName = computed(() => {
    if (!client.value) return "";
    return `${client.value.last_name} ${client.value.first_name} ${client.value.middle_name}`;
});

async function loadClient() {
    try {
        const response = await useApi<Client>(`/clients/${clientId.value}`);
        if (response.data && !response.data.message) {
            client.value = response.data;
        } else {
            ElMessage.error({
                message: "Клиент не найден",
                offset: 48,
            });
            router.push("/clients");
        }
    } catch (error) {
        ElMessage.error("Ошибка загрузки данных о клиенте");
    }
}

async function loadAnimals() {
    try {
        const response = await useApi<Animal[]>(`/animals`);
        if (response.data) {
            animals.value = response.data.filter(
                (animal) => animal.client_id === clientId.value
            );
        }
    } catch (error) {
        ElMessage.error("Ошибка загрузки данных о животных");
    }
}
async function loadAnimalTypes() {
    try {
        const response = await useApi<AnimalType[]>("/animal_types");
        if (response.data) {
            animalTypes.value = response.data;
        }
    } catch (error) {
        ElMessage.error("Ошибка загрузки типов животных");
    }
}

function getAnimalTypeName(typeId: number): string {
    const type = animalTypes.value.find((t) => t.id === typeId);
    return type ? type.name : "Неизвестно";
}

function formatDate(dateString: string): string {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0"); // месяцы от 0 до 11
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
}

onMounted(async () => {
    await loadClient();
    await loadAnimals();
    await loadAnimalTypes();
});
</script>

<style lang="scss" scoped>
.page-header {
    display: flex;
    align-items: center;
    gap: 12px;
}

.back-button {
    font-size: 18px;
    transition: var(--el-transition-duration);
    cursor: pointer;
    &:hover {
        color: var(--el-color-primary);
    }
}

.buttons-container {
    margin-top: 16px;
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    .search {
        max-width: 270px;
    }
    .el-button {
        margin: 0;
    }
}

.columns-container {
    margin-top: 36px;
    display: grid;
    column-gap: 60px;
    row-gap: 24px;
    grid-template-columns: 300px minmax(300px, 1fr);
    align-items: start;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
}

.column-header {
    font-family: Inter;
    font-size: 18px;
    font-weight: 500;
}

.column-content {
    margin-top: 16px;
}

.pets {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 40px;
}

.tag {
    --el-tag-font-size: 14px;
}

.animal-link {
    font-size: 18px;
    font-family: Inter;
    text-decoration: underline;
}

.el-descriptions__header {
    margin-bottom: 0;
}
</style>
