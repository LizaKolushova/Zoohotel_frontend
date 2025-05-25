<template>
    <h2 class="page-header">Животные</h2>

    <div class="filters-container">
        <el-button
            class="filters-item"
            type="primary"
            :size="size"
            @click="router.push(`/animals/create`)"
            >Новое животное</el-button
        >
        <el-input
            class="search filters-item"
            :prefix-icon="'search'"
            v-model="filterOptions.name"
            clearable
            placeholder="Поиск животного"
            :size="size"
        ></el-input>

        <el-select
            class="type-select filters-item"
            placeholder="Тип животного"
            v-model="filterOptions.animal_type"
            clearable
            :value-on-clear="null"
            :size="size"
        >
            <el-option
                v-for="animal_type in animalTypesData"
                :value="animal_type.name"
                :key="animal_type.id"
            >
                {{ animal_type.name }}
            </el-option>
        </el-select>

        <el-select
            class="gender-select filters-item"
            placeholder="Пол"
            v-model="filterOptions.gender"
            clearable
            :value-on-clear="null"
            :size="size"
        >
            <el-option
                v-for="gender in Gender"
                :value="gender"
                :label="gender == 'male' ? 'М' : 'Ж'"
                :key="gender"
            >
                {{ gender == "male" ? "М" : "Ж" }}
            </el-option>
        </el-select>

        <el-select
            class="sterilization-select filters-item"
            placeholder="Стерилизация"
            v-model="filterOptions.sterilization"
            clearable
            :value-on-clear="null"
            :size="size"
        >
            <el-option
                v-for="sterilization in Sterilization"
                :value="sterilization"
                :key="sterilization"
            >
                {{ sterilization }}
            </el-option>
        </el-select>
        <div class="date-picker-container">
            <el-date-picker
                value-format="YYYY-MM-DD"
                class="date-picker filters-item"
                v-model="filterOptions.date"
                type="date"
                placeholder="Дата рождения"
                :size="size"
            />
        </div>

        <el-button class="filters-item" :size="size" @click="resetFilters"
            >Сбросить фильтры</el-button
        >
    </div>

    <el-table class="table" :data="filteredAnimals" stripe>
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="Кличка" width="180">
            <template #default="scope">
                <router-link
                    class="animal-link"
                    :to="`/animals/${scope.row.id}`"
                    >{{ scope.row.name }}</router-link
                >
            </template>
        </el-table-column>
        <el-table-column
            prop="animal_type_id"
            label="Тип животного"
            :formatter="animalTypeFormatter"
            width="130"
        />
        <el-table-column prop="breed" label="Порода" width="200" />
        <el-table-column
            prop="gender"
            label="Пол"
            :formatter="genderFormatter"
            width="60"
        />
        <el-table-column prop="weight" label="Вес, кг" width="80" />
        <el-table-column prop="color" label="Окрас" width="140" />
        <el-table-column prop="birth_date" label="Дата рождения" width="135" />
        <el-table-column
            prop="sterilized"
            label="Стерилизация"
            :formatter="sterilizedFormatter"
            width="130"
        />
        <el-table-column label="Операции" width="208" fixed="right">
            <template #default="scope">
                <el-button
                    class="operation-button"
                    type="primary"
                    icon="Calendar"
                    tag="router-link"
                    to="/"
                ></el-button>
                <el-button
                    class="operation-button"
                    type="success"
                    icon="CreditCard"
                    tag="router-link"
                    :to="`animals/${scope.row.id}/passport`"
                ></el-button>
                <el-button
                    class="operation-button"
                    type="info"
                    icon="EditPen"
                    tag="router-link"
                    :to="`/animals/${scope.row.id}/edit`"
                ></el-button>
                <el-button
                    class="operation-button"
                    type="danger"
                    icon="Delete"
                    @click="deleteAnimal(scope.row.id)"
                ></el-button>
            </template>
        </el-table-column>
    </el-table>
    <div class="pagination">
        <el-pagination
            background
            layout="prev, pager, next, jumper"
            :total="totalAnimals"
            :page-size="pageSize"
            @current-change="handleCurrentChange"
        />
    </div>
</template>

<script setup lang="ts">
import { useApi } from "@/composables/useApi";
import { ElMessage, ElMessageBox } from "element-plus";
import { computed, onMounted, reactive, ref } from "vue";
import type { Animal, AnimalType } from "@/types/types";
import { Gender, Sterilization } from "@/types/enums";
import router from "@/router";

onMounted(async () => {
    await getAnimalData();
});

const size = "large";

interface FilterOptions {
    name: string;
    animal_type: string;
    gender: Gender | null;
    sterilization: Sterilization | null;
    date: string | null;
}

const animalData = ref<Animal[]>([]);
const animalTypesData = ref<AnimalType[]>([]);
const filterOptions = reactive<FilterOptions>({
    name: "",
    animal_type: "",
    gender: null,
    sterilization: null,
    date: null,
});

const pageSize = 10;
const currentPage = ref(1);

const totalAnimals = computed(() => animalData.value.length);

const filteredAnimals = computed(() => {
    return animalData.value
        .filter((animal) => {
            return (
                (!filterOptions.name ||
                    animal.name
                        .toLowerCase()
                        .includes(filterOptions.name.toLowerCase())) &&
                (!filterOptions.animal_type ||
                    animalTypeFormatter(animal) ===
                        filterOptions.animal_type) &&
                (!filterOptions.gender ||
                    animal.gender === filterOptions.gender) &&
                (!filterOptions.sterilization ||
                    sterilizedFormatter(animal) ===
                        filterOptions.sterilization) &&
                (!filterOptions.date ||
                    animal.birth_date === filterOptions.date)
            );
        })
        .slice(
            (currentPage.value - 1) * pageSize,
            currentPage.value * pageSize
        );
});

function handleCurrentChange(val: number) {
    currentPage.value = val;
}

async function getAnimalData() {
    try {
        const response = await useApi<Animal[]>("/animals");
        animalData.value = response.data;
    } catch (error) {
        console.error("Ошибка загрузки данных:", error);
    }

    try {
        const response = await useApi<AnimalType[]>("/animal_types");
        animalTypesData.value = response.data;
    } catch (error) {
        console.error("Ошибка загрузки данных:", error);
    }
}

function animalTypeFormatter(row: Animal) {
    if (animalTypesData.value[row.animal_type_id - 1]) {
        return animalTypesData.value[row.animal_type_id - 1].name;
    }
}

function genderFormatter(row: Animal) {
    return row.gender == "male" ? "М" : "Ж";
}

function sterilizedFormatter(row: Animal) {
    return row.sterilized ? "Да" : "Нет";
}

function resetFilters() {
    filterOptions.name = "";
    filterOptions.animal_type = "";
    filterOptions.gender = null;
    filterOptions.sterilization = null;
    filterOptions.date = null;
}

function deleteAnimal(id: number) {
    const deletingIndex = animalData.value.findIndex((element) => {
        return element.id === id;
    });
    ElMessageBox.confirm(
        "Вы уверены, что хотите удалить животное?",
        "Подтвердите удаление",
        {
            cancelButtonText: "Отмена",
            confirmButtonText: "Удалить",
            type: "warning",
        }
    ).then(async () => {
        animalData.value.splice(deletingIndex, 1);
        const response = await useApi<Animal>("/animals/" + `${id}`, {
            method: "DELETE",
        });
        if (response.error) {
            console.error(response.error);
        } else {
            ElMessage({
                type: "success",
                message: "Животное удалено",
            });
        }
    });
}
</script>

<style lang="scss" scoped>
.date-picker-container {
    max-width: 300px;
}
.filters-container {
    margin-top: 16px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .filters-item {
        flex-grow: 1;
    }
}

.search {
    width: 270px;
}

.type-select {
    width: 170px;
}

.gender-select {
    width: 100px;
}

.sterilization-select {
    width: 160px;
}

.operation-button {
    width: 40px;
    height: 24px;
    & + .operation-button {
        margin-left: 8px;
    }
}

.el-message-box__btns {
    flex-direction: row-reverse;
    justify-content: flex-start;
    gap: 12px;
}

.modal {
    --el-dialog-width: 80%;
    max-width: 600px;
}

.modal-buttons {
    display: flex;
    justify-content: end;
}

.el-form-item__label {
    font-weight: 500;
}

.animal-link {
    color: var(--el-table-text-color);
    text-decoration: underline;
    transition: var(--el-transition-duration);
    &:hover {
        text-decoration: none;
    }
}
</style>
