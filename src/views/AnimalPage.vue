<template>
    <div class="page-header">
        <el-button class="back-button" :icon="Back" @click="router.back()" text>
        </el-button>
        <h2>{{ animal.name }}</h2>
    </div>

    <div class="buttons-container">
        <el-button
            size="large"
            type="primary"
            tag="router-link"
            class="button"
            :to="`/animals/${animalId}/edit`"
            >Редактировать</el-button
        >
        <el-button
            size="large"
            tag="router-link"
            class="button"
            :to="`/animals/${animalId}/passport`"
            >Заполнить мед. карту</el-button
        >
        <el-button
            size="large"
            class="button"
            @click="handeOpenVaccinationModal(undefined)"
            >Добавить прививку</el-button
        >
        <el-button
            size="large"
            class="button"
            @click="handleOpenTreatmentModal(undefined)"
            >Добавить обработку</el-button
        >
        <el-button
            size="large"
            class="button"
            @click="handleOpenMedicalRecordModal(undefined)"
            >Добавить осмотр</el-button
        >
    </div>

    <div class="column-container">
        <div class="animal-data">
            <el-descriptions
                class="animal-description description"
                border
                :column="1"
                label-width="140"
            >
                <template #title
                    ><h4 class="description-header">
                        Информация о животном
                    </h4></template
                >
                <el-descriptions-item label="Кличка">{{
                    animal.name
                }}</el-descriptions-item>
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
            <el-descriptions
                v-if="animalPassport"
                class="passport-description description"
                border
                :column="1"
                label-width="170"
            >
                <template #title
                    ><h4 class="description-header">
                        Паспорт животного
                    </h4></template
                >

                <el-descriptions-item label="Дата ветвизита">{{
                    animalPassport.last_vet_visit
                }}</el-descriptions-item>
                <el-descriptions-item label="Причина ветвизита">{{
                    animalPassport.vet_visit_reason
                }}</el-descriptions-item>
                <el-descriptions-item label="Хронические заболевания">{{
                    animalPassport.chronic_diseases
                        ? animalPassport.chronic_diseases
                        : "Отсутствуют"
                }}</el-descriptions-item>
                <el-descriptions-item label="Перенесенные заболевания">{{
                    animalPassport.past_diseases
                }}</el-descriptions-item>
                <el-descriptions-item label="Контакт ветврача">{{
                    animalPassport.vet_contacts
                }}</el-descriptions-item>
                <el-descriptions-item label="Особенности здоровья">{{
                    animalPassport.health_features
                }}</el-descriptions-item>
            </el-descriptions>
        </div>
        <div class="medical-animal-data">
            <div class="grid">
                <div class="vaccinations-table-container">
                    <h4 class="table-header">
                        Прививки
                        <el-button
                            class="add-button"
                            text
                            icon="plus"
                            @click="handeOpenVaccinationModal(undefined)"
                        ></el-button>
                    </h4>
                    <el-table
                        stripe
                        class="table"
                        :data="
                            vaccinations.slice(
                                (currentVaccinationsPage - 1) * pageSize,
                                currentVaccinationsPage * pageSize
                            )
                        "
                    >
                        <el-table-column
                            width="110"
                            prop="vaccination_date"
                            label="Дата"
                        ></el-table-column>
                        <el-table-column
                            prop="vaccination_name"
                            label="Название прививки"
                            min-width="250"
                        ></el-table-column>
                        <el-table-column
                            fixed="right"
                            label="Операции"
                            width="95"
                            align="center"
                        >
                            <template #default="scope">
                                <el-button
                                    class="operation-button"
                                    type="info"
                                    icon="EditPen"
                                    @click="
                                        handeOpenVaccinationModal(scope.row)
                                    "
                                ></el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                    <div class="pagination">
                        <el-pagination
                            background
                            layout="prev, pager, next, jumper"
                            :total="totalVaccinations"
                            :page-size="pageSize"
                            @current-change="handleCurrentVaccinationsChange"
                        />
                    </div>
                </div>
                <div class="treatments-table-container">
                    <h4 class="table-header">
                        Обработки
                        <el-button
                            class="add-button"
                            text
                            icon="plus"
                            @click="handleOpenTreatmentModal(undefined)"
                        ></el-button>
                    </h4>
                    <el-table
                        class="table"
                        :data="
                            treatments.slice(
                                (currentTreatmentsPage - 1) * pageSize,
                                currentTreatmentsPage * pageSize
                            )
                        "
                        stripe
                    >
                        <el-table-column
                            width="110"
                            prop="treatment_date"
                            label="Дата"
                        ></el-table-column>
                        <el-table-column
                            prop="treatment_type"
                            min-width="250"
                            label="Название обработки"
                        ></el-table-column>
                        <el-table-column
                            fixed="right"
                            label="Операции"
                            width="95"
                            align="center"
                        >
                            <template #default="scope">
                                <el-button
                                    class="operation-button"
                                    type="info"
                                    icon="EditPen"
                                    @click="handleOpenTreatmentModal(scope.row)"
                                ></el-button>
                            </template> </el-table-column
                    ></el-table>
                    <div class="pagination">
                        <el-pagination
                            background
                            layout="prev, pager, next, jumper"
                            :total="totalTreatments"
                            :page-size="pageSize"
                            @current-change="handleCurrentTreatmentsChange"
                        />
                    </div>
                </div>
                <div class="medical-records-table-container">
                    <h4 class="table-header">
                        Медицинские записи
                        <el-button
                            class="add-button"
                            text
                            icon="plus"
                            @click="handleOpenMedicalRecordModal(undefined)"
                        ></el-button>
                    </h4>
                    <el-table
                        class="table"
                        :data="
                            medicalRecords.slice(
                                (currentMedicalRecordsPage - 1) * pageSize,
                                currentMedicalRecordsPage * pageSize
                            )
                        "
                        stripe
                        ><el-table-column
                            width="110"
                            prop="date"
                            label="Дата"
                        ></el-table-column>
                        <el-table-column
                            width="140"
                            prop="diagnosis"
                            label="Диагноз"
                        ></el-table-column>
                        <el-table-column
                            width="220"
                            prop="treatment"
                            label="Леченеие"
                        ></el-table-column>
                        <el-table-column
                            width="190"
                            prop="prescriptions"
                            label="Назначения"
                        ></el-table-column>
                        <el-table-column
                            prop="notes"
                            width="250"
                            label="Заметки"
                        ></el-table-column>
                        <el-table-column
                            label="Операции"
                            width="95"
                            align="center"
                            fixed="right"
                        >
                            <template #default="scope">
                                <el-button
                                    class="operation-button"
                                    type="info"
                                    icon="EditPen"
                                    @click="
                                        handleOpenMedicalRecordModal(scope.row)
                                    "
                                ></el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                    <div class="pagination">
                        <el-pagination
                            background
                            layout="prev, pager, next, jumper"
                            :total="totalMedicalRecords"
                            :page-size="pageSize"
                            @current-change="handleCurrentMedicalRecordsChange"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>

    <el-dialog
        v-model="vaccinationModalIsVisible"
        width="500"
        :title="vaccinationModalTitle"
    >
        <VaccinationForm
            @complete="
                vaccinationModalIsVisible = false;
                loadVaccinations();
            "
            @cancel="vaccinationModalIsVisible = false"
            :form-data="vaccinationModalFormData"
        ></VaccinationForm>
    </el-dialog>

    <el-dialog
        v-model="treatmentModalIsVisible"
        width="500"
        :title="treatmentModalTitle"
    >
        <TreatmentForm
            @complete="
                treatmentModalIsVisible = false;
                loadTreatments();
            "
            @cancel="treatmentModalIsVisible = false"
            :form-data="treatmentModalFormData"
        ></TreatmentForm>
    </el-dialog>
    <el-dialog
        v-model="medicalRecordModalIsVisible"
        width="500"
        :title="medicalRecordModalTitle"
    >
        <MedicalRecordForm
            @complete="
                medicalRecordModalIsVisible = false;
                loadMedicalRecords();
            "
            @cancel="medicalRecordModalIsVisible = false"
            :form-data="medicalRecordModalFormData"
        ></MedicalRecordForm>
    </el-dialog>
</template>

<script setup lang="ts">
import VaccinationForm from "@/components/VaccinationForm.vue";
import TreatmentForm from "@/components/TreatmentForm.vue";
import MedicalRecordForm from "@/components/MedicalRecordForm.vue";
import type {
    Animal,
    AnimalPassport,
    AnimalType,
    MedicalRecord,
    Treatment,
    Vaccination,
} from "@/types/types";
import { useApi } from "@/composables/useApi";
import { computed, onMounted, ref } from "vue";
import { Gender } from "@/types/enums";
import { ElMessage } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import { Back } from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();
const animalId = ref(+route.params.id);

const animal = ref<Animal>({
    id: 0,
    name: "",
    animal_type_id: 1,
    client_id: 0,
    breed: "",
    gender: Gender.FEMALE,
    weight: 0,
    color: "",
    birth_date: "",
    sterilized: false,
    description: "",
});
const animalPassport = ref<AnimalPassport>();
const vaccinations = ref<Vaccination[]>([]);
const treatments = ref<Treatment[]>([]);
const medicalRecords = ref<MedicalRecord[]>([]);
const animalTypes = ref<AnimalType[]>([]);

const pageSize = 5;
const totalVaccinations = computed(() => vaccinations.value.length);
const currentVaccinationsPage = ref<number>(1);
function handleCurrentVaccinationsChange(val: number) {
    currentVaccinationsPage.value = val;
}
const totalTreatments = computed(() => treatments.value.length);
const currentTreatmentsPage = ref<number>(1);
function handleCurrentTreatmentsChange(val: number) {
    currentTreatmentsPage.value = val;
}
const totalMedicalRecords = computed(() => medicalRecords.value.length);
const currentMedicalRecordsPage = ref<number>(1);
function handleCurrentMedicalRecordsChange(val: number) {
    currentMedicalRecordsPage.value = val;
}

// Модальное окно для прививок
const vaccinationModalIsVisible = ref(false);
const vaccinationModalFormData = ref<Vaccination>({
    id: 0,
    animal_id: animalId.value,
    vaccination_date: "",
    vaccination_name: "",
});
const vaccinationModalTitle = computed(() => {
    if (vaccinationModalFormData.value.id) {
        return "Редактирование прививки";
    } else {
        return "Добавление новой прививки";
    }
});
function handeOpenVaccinationModal(vaccination: Vaccination | undefined) {
    vaccinationModalIsVisible.value = true;
    if (vaccination) {
        // Создаем глубокую копию объекта, чтобы изменения в форме не влияли на оригинальные данные
        vaccinationModalFormData.value = JSON.parse(
            JSON.stringify(vaccination)
        );
    } else {
        vaccinationModalFormData.value = {
            id: 0,
            animal_id: animalId.value,
            vaccination_date: "",
            vaccination_name: "",
        };
    }
}

// Модальное окно для обработок
const treatmentModalIsVisible = ref(false);
const treatmentModalFormData = ref<Treatment>({
    id: 0,
    animal_id: animalId.value,
    treatment_date: "",
    treatment_type: "",
    description: "",
});
const treatmentModalTitle = computed(() => {
    if (treatmentModalFormData.value.id) {
        return "Редактирование обработки";
    } else {
        return "Добавление новой обработки";
    }
});
function handleOpenTreatmentModal(treatment: Treatment | undefined) {
    treatmentModalIsVisible.value = true;
    if (treatment) {
        treatmentModalFormData.value = JSON.parse(JSON.stringify(treatment));
    } else {
        treatmentModalFormData.value = {
            id: 0,
            animal_id: animalId.value,
            treatment_date: "",
            treatment_type: "",
            description: "",
        };
    }
}

const medicalRecordModalIsVisible = ref(false);
const medicalRecordModalFormData = ref<MedicalRecord>({
    id: 0,
    animal_id: animalId.value,
    system_user_id: 0, // предполагается, что это будет заполнено с сервера или из хранилища состояния
    date: "",
    diagnosis: "",
    treatment: "",
    prescriptions: "",
    notes: "",
});
const medicalRecordModalTitle = computed(() => {
    if (medicalRecordModalFormData.value.id) {
        return "Редактирование медицинской записи";
    } else {
        return "Добавление новой медицинской записи";
    }
});

function handleOpenMedicalRecordModal(
    medicalRecord: MedicalRecord | undefined
) {
    medicalRecordModalIsVisible.value = true;
    if (medicalRecord) {
        // Создаем глубокую копию объекта
        medicalRecordModalFormData.value = JSON.parse(
            JSON.stringify(medicalRecord)
        );
    } else {
        medicalRecordModalFormData.value = {
            id: 0,
            animal_id: animalId.value,
            system_user_id: 0,
            date: "",
            diagnosis: "",
            treatment: "",
            prescriptions: "",
            notes: "",
        };
    }
}

async function loadAnimal() {
    try {
        const response = await useApi<Animal>(`/animals/${animalId.value}`);
        if (response.data && !response.data.message) {
            animal.value = response.data;
        } else {
            ElMessage.error({
                message: "Питомец не найден",
                offset: 48,
            });
            router.push("/clients");
        }
    } catch (error) {
        console.error("Ошибка загрузки животного:", error);
        ElMessage.error("Ошибка загрузки данных о животном");
    }
}

async function loadAnimalPassport() {
    try {
        const response = await useApi<AnimalPassport>(
            `/animals/${animalId.value}/passport`
        );
        if (response.data) {
            animalPassport.value = response.data;
        }
    } catch (error) {
        console.error("Ошибка загрузки прививок:", error);
        ElMessage.error("Ошибка загрузки данных о прививках");
    }
}

async function loadVaccinations() {
    try {
        const response = await useApi<Vaccination[]>(
            `/animals/${animalId.value}/vaccinations`
        );
        if (response.data) {
            vaccinations.value = response.data;
        }
    } catch (error) {
        console.error("Ошибка загрузки прививок:", error);
        ElMessage.error("Ошибка загрузки данных о прививках");
    }
}

async function loadTreatments() {
    try {
        const response = await useApi<Treatment[]>(
            `/animals/${animalId.value}/treatments`
        );
        if (response.data) {
            treatments.value = response.data;
        }
    } catch (error) {
        console.error("Ошибка загрузки обработок:", error);
        ElMessage.error("Ошибка загрузки данных об обработках");
    }
}

async function loadMedicalRecords() {
    try {
        const response = await useApi<MedicalRecord[]>(
            `/animals/${animalId.value}/medical_records`
        );
        if (response.data) {
            medicalRecords.value = response.data;
        }
    } catch (error) {
        console.error("Ошибка загрузки медицинских записей:", error);
        ElMessage.error("Ошибка загрузки данных о медицинских записях");
    }
}

async function loadAnimalTypes() {
    try {
        const response = await useApi<AnimalType[]>("/animal_types");
        if (response.data) {
            animalTypes.value = response.data;
        }
    } catch (error) {
        console.error("Ошибка загрузки типов животных:", error);
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
    await loadAnimal();
    await loadVaccinations();
    await loadTreatments();
    await loadMedicalRecords();
    await loadAnimalTypes();
    await loadAnimalPassport();
});
</script>
<style lang="scss" scoped>
.table-header {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 18px;
    font-weight: 500;
    line-height: 100%;
    color: var(--el-text-color-primary);
}
.table {
    margin-top: 16px;
    width: 100%;
}

.column-container {
    display: grid;
    column-gap: 60px;
    grid-template-columns: 350px 1fr;
    width: 100%;
    max-width: 100%;
    margin-top: 40px;

    @media (max-width: 1024px) {
        grid-template-columns: 1fr; /* На маленьких экранах стеки один под другим */
        row-gap: 30px;
    }
}

.tag {
    --el-tag-font-size: 14px;
}

.description {
    width: 100%;
    max-width: 350px;

    @media (max-width: 1024px) {
        max-width: 100%;
    }
}

.description-header {
    margin-bottom: 16px;
    display: block;
    font-size: 18px;
    font-weight: 500;
}

.animal-data {
    gap: 40px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
}

.medical-animal-data {
    width: 100%;
    min-width: 0; /* Важно для предотвращения переполнения grid */
}

.grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); /* Используем minmax для лучшей адаптивности */
    width: 100%;
    gap: 20px;

    @media (max-width: 920px) {
        grid-template-columns: minmax(0, 1fr);
    }
}

.medical-records-table-container {
    grid-column: span 2;
    width: 100%;

    @media (max-width: 920px) {
        grid-column: span 1;
    }
}

.add-button {
    color: var(--el-text-color-primary);
    font-size: 18px;
    padding: 0;
    height: 18px;
}

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
    flex-wrap: wrap;
    gap: 8px;

    .button {
        margin-left: 0;
    }
}
</style>
