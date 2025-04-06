<template>
    <h2 class="page-header">Животные</h2>

    <div class="filters-container">
        <el-button
            class="filters-item"
            type="primary"
            :size="size"
            @click="openCreateAnimalModal"
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

        <el-date-picker
            value-format="YYYY-MM-DD"
            class="date-picker filters-item"
            v-model="filterOptions.date"
            type="date"
            placeholder="Дата рождения"
            :size="size"
        />

        <el-button class="filters-item" :size="size" @click="resetFilters"
            >Сбросить фильтры</el-button
        >
    </div>

    <el-table class="table" :data="filteredAnimals" stripe>
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="Кличка" width="180" />
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
                ></el-button>
                <el-button
                    class="operation-button"
                    type="success"
                    icon="CreditCard"
                ></el-button>
                <el-button
                    class="operation-button"
                    type="info"
                    icon="EditPen"
                    @click="
                        openEdittingAnimalModal(
                            JSON.parse(JSON.stringify(scope.row))
                        )
                    "
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

    <el-dialog v-model="animalModalIsVisible" :title="modalTitle" class="modal">
        <el-form :model="modalAnimalData" label-position="top">
            <el-form-item label="Кличка" prop="name">
                <el-input v-model="modalAnimalData.name"></el-input>
            </el-form-item>
            <el-form-item label="Тип животного" prop="animal_type_id">
                <el-select v-model="modalAnimalData.animal_type_id">
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
                <el-input v-model="modalAnimalData.breed"></el-input>
            </el-form-item>
            <el-form-item label="Пол" prop="gender">
                <el-select v-model="modalAnimalData.gender">
                    <el-option
                        v-for="gender in Gender"
                        :value="gender"
                        :label="gender == 'male' ? 'М' : 'Ж'"
                        :key="gender"
                    >
                        {{ gender == "male" ? "М" : "Ж" }}
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="Вес" prop="weight">
                <el-input v-model="modalAnimalData.weight"> </el-input>
            </el-form-item>
            <el-form-item label="Окрас" prop="color">
                <el-input v-model="modalAnimalData.color"> </el-input>
            </el-form-item>
            <el-form-item label="Дата рождения" prop="birth_date">
                <el-date-picker
                    value-format="YYYY-MM-DD"
                    v-model="modalAnimalData.birth_date"
                    type="date"
                    placeholder="Дата рождения"
                />
            </el-form-item>
            <el-form-item label="Стерилизовано" prop="sterilized">
                <el-select v-model="modalAnimalData.sterilized">
                    <el-option
                        v-for="sterilization in Sterilization"
                        :value="sterilization == 'Да' ? true : false"
                        :label="sterilization"
                        :key="sterilization"
                    >
                        {{ sterilization }}
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="Особенности" prop="description">
                <el-input v-model="modalAnimalData.description" type="textarea">
                </el-input>
            </el-form-item>
            <div class="modal-buttons">
                <el-button type="primary" @click="sendAnimalData()">{{
                    edittingAnimal ? "Изменить" : "Добавить"
                }}</el-button>
                <el-button @click="animalModalIsVisible = false"
                    >Отмена</el-button
                >
            </div>
        </el-form>
    </el-dialog>
</template>

<script setup lang="ts">
import { useApi } from "@/composables/useApi";
import { ElMessage, ElMessageBox } from "element-plus";
import { computed, onMounted, reactive, ref } from "vue";
import type { Animal, AnimalType } from "@/types/types";
import { Gender, Sterilization } from "@/types/enums";

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
const filteredAnimals = computed(() => {
    return animalData.value.filter((animal) => {
        return (
            (!filterOptions.name ||
                animal.name
                    .toLowerCase()
                    .includes(filterOptions.name.toLowerCase())) &&
            (!filterOptions.animal_type ||
                animalTypeFormatter(animal) === filterOptions.animal_type) &&
            (!filterOptions.gender || animal.gender === filterOptions.gender) &&
            (!filterOptions.sterilization ||
                sterilizedFormatter(animal) === filterOptions.sterilization) &&
            (!filterOptions.date || animal.birth_date === filterOptions.date)
        );
    });
});

const animalModalIsVisible = ref<Boolean>(false);
const edittingAnimal = ref<Boolean>(false);
const modalAnimalData = ref<Animal>(animalData.value[0]);
const modalTitle = ref<string>("Добавление нового животного");

function openEdittingAnimalModal(animal: Animal) {
    modalTitle.value = `Редактирование животного '${animal.name}'`;
    edittingAnimal.value = true;
    modalAnimalData.value = animal;
    animalModalIsVisible.value = true;
}

function openCreateAnimalModal(animal: Animal) {
    edittingAnimal.value = false;
    modalTitle.value = "Добавление нового животного";
    modalAnimalData.value = {
        id: 0,
        name: "",
        animal_type_id: 1,
        client_id: animal.client_id,
        breed: "",
        gender: Gender.FEMALE,
        weight: 0,
        color: "",
        description: "",
        birth_date: "",
        sterilized: false,
    };
    animalModalIsVisible.value = true;
}

async function sendAnimalData() {
    try {
        const response = await useApi<{ message: string }>("/animals", {
            method: "post",
            data: modalAnimalData.value,
        });
        ElMessage({
            type: "success",
            message: response.data.message,
            offset: 48,
        });
        await getAnimalData();
        return response;
    } catch (error) {
        console.error("Ошибка загрузки данных:", error);
        return "Ошибка: " + error;
    } finally {
        animalModalIsVisible.value = false;
    }
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

.date-picker {
    --el-date-editor-width: 200px;
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
</style>
