<template>
    <div class="inputs-container">
        <el-select
            class="pets-select"
            v-model="selectedPetIds"
            filterable
            multiple
            collapse-tags
            collapse-tags-tooltip
            :suffix-icon="Search"
            placeholder="Поиск питомцев по кличке"
            no-match-text="Питомцев не найдено"
            size="large"
            clearable
            @change="petFormOpened = false"
        >
            <el-option
                v-for="pet in clientPets"
                :key="pet.id"
                :label="pet.name"
                :value="pet.id"
            >
                {{ pet.name }} ({{
                    bookingStore.getAnimalTypeName(pet.animal_type_id)
                }})
            </el-option>
        </el-select>

        <el-button
            class="add-pet-button"
            size="large"
            v-if="!petFormOpened"
            @click="
                openPetForm(0);
                selectedPetIds = [];
            "
        >
            Добавить питомца
            <el-icon type="primary" class="add-icon">
                <Plus />
            </el-icon>
        </el-button>
    </div>

    <AnimalForm
        v-if="petFormOpened"
        :is-editing="petFormIsEditing"
        :animal-id="petFormPetId"
        :client-id="bookingStore.selectedClient?.id"
        @complete="handlePetFormComplete"
        @cancel="petFormOpened = false"
    ></AnimalForm>

    <div
        class="pets-grid-container"
        v-if="selectedAnimals.length > 0 && !petFormOpened"
    >
        <h4 class="section-header">Информация о питомцах</h4>
        <div class="pets-grid">
            <div
                v-for="animal in selectedAnimals"
                :key="animal.id"
                class="pet-card"
            >
                <el-descriptions :column="1" border label-width="140">
                    <template #title>
                        <div class="pet-header">
                            <h5 class="pet-name">{{ animal.name }}</h5>
                            <el-button
                                type="primary"
                                text
                                @click="openPetForm(animal.id)"
                            >
                                Редактировать
                            </el-button>
                        </div>
                    </template>
                    <el-descriptions-item label="Тип животного"
                        ><el-tag class="tag">{{
                            bookingStore.getAnimalTypeName(
                                animal.animal_type_id
                            )
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
                        animal.birth_date
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
import AnimalForm from "./AnimalForm.vue";
import { Search, Plus } from "@element-plus/icons-vue";
import type { Animal } from "@/types/types";
import { computed, onMounted, ref, watch } from "vue";
import { useBookingStore } from "@/stores/bookingStore";

const bookingStore = useBookingStore();
const selectedPetIds = ref<number[]>([]);

const clientPets = computed(() => {
    return bookingStore.clientAnimals;
});

const selectedAnimals = computed(() => {
    return clientPets.value.filter((pet) =>
        selectedPetIds.value.includes(pet.id)
    );
});

const petFormOpened = ref(false);
const petFormPetId = ref<number>();
const petFormIsEditing = ref(false);

function openPetForm(petId: number) {
    petFormOpened.value = true;
    petFormPetId.value = petId;
    petFormIsEditing.value = petId !== 0;
}

function handlePetFormComplete(petId: number) {
    petFormOpened.value = false;
    // Обновляем список питомцев
    bookingStore.loadAnimals().then(() => {
        // После обновления списка добавляем питомца к выбранным если его там еще нет
        if (!selectedPetIds.value.includes(petId)) {
            selectedPetIds.value.push(petId);
        }
    });
}

onMounted(() => {
    // Если в хранилище уже есть выбранные питомцы, устанавливаем их ids
    if (bookingStore.selectedPets.length > 0) {
        selectedPetIds.value = bookingStore.selectedPets.map((pet) => pet.id);
    }
});

// Следим за изменением выбранных питомцев и обновляем хранилище
watch(selectedAnimals, (newAnimals) => {
    bookingStore.setPets(newAnimals);
});
</script>

<style lang="scss" scoped>
.add-icon {
    margin-left: 8px;
}

.inputs-container {
    margin-top: 16px;
    display: flex;
    gap: 8px;

    @media (max-width: 650px) {
        flex-wrap: wrap;
    }
    .pets-select {
        flex: 1 1 100%;
        @media (max-width: 650px) {
            max-width: 100%;
        }
    }

    .add-pet-button {
        max-width: 200px;
        flex: 1 1 100%;

        @media (max-width: 650px) {
            max-width: 100%;
        }
    }
}

.section-header {
    margin-bottom: 16px;
    display: block;
    font-size: 18px;
    font-weight: 500;
}

.pets-grid-container {
    margin-top: 36px;
}

.pets-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 16px;
}

.pet-card {
    border-radius: 4px;
    overflow: hidden;
}

.pet-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.pet-name {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
}
</style>
