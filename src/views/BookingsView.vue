<template>
    <h2 class="page-header">Список броней</h2>

    <div class="filters-container">
        <el-button
            class="filters-item"
            type="primary"
            :size="size"
            tag="router-link"
            to="bookings/create"
            >Новое бронирование</el-button
        >
        <el-input
            class="search filters-item"
            :prefix-icon="'search'"
            v-model="filterOptions.client"
            clearable
            placeholder="Поиск клиента"
            :size="size"
        ></el-input>

        <el-select
            class="animal-type-select filters-item"
            placeholder="Тип животного"
            v-model="filterOptions.animal_type"
            clearable
            :value-on-clear="null"
            :size="size"
        >
            <el-option
                v-for="animalType in animalTypesData"
                :value="animalType.name"
                :key="animalType.id"
            >
                {{ animalType.name }}
            </el-option>
        </el-select>

        <el-select
            class="status-select filters-item"
            placeholder="Статус"
            v-model="filterOptions.status"
            clearable
            :value-on-clear="null"
            :size="size"
        >
            <el-option
                v-for="status in bookingStatuses"
                :value="status.value"
                :key="status.value"
                :label="status.label"
            >
                {{ status.label }}
            </el-option>
        </el-select>

        <div class="date-range filters-item">
            <el-date-picker
                value-format="DD-MM-YYYY"
                v-model="filterOptions.dateRange"
                type="daterange"
                range-separator="до"
                start-placeholder="Начало"
                end-placeholder="Конец"
                :size="size"
            />
        </div>

        <el-button class="filters-item" :size="size" @click="resetFilters"
            >Сбросить фильтры</el-button
        >
    </div>

    <el-table class="table" :data="filteredBookings" stripe>
        <el-table-column type="selection" width="55" />
        <el-table-column label="ID" prop="id" width="60" />
        <el-table-column prop="client" label="Клиент" width="180">
            <template #default="scope">
                {{ getClientFullName(scope.row.client_id) }}
            </template>
        </el-table-column>
        <el-table-column prop="animal" label="Кличка" width="140">
            <template #default="scope">
                {{ getAnimalName(scope.row.animal_id) }}
            </template>
        </el-table-column>
        <el-table-column prop="type" label="Тип размещения" width="150">
            <template #default="scope">
                {{ getPricingName(scope.row.pricing_id) }}
            </template>
        </el-table-column>
        <el-table-column prop="animal_type" label="Тип животного" width="140">
            <template #default="scope">
                {{ getAnimalType(scope.row.animal_id) }}
            </template>
        </el-table-column>
        <el-table-column prop="start_date" label="Дата начала" width="120"
            ><template #default="scope">
                {{ formatDate(scope.row.start_date) }}
            </template>
        </el-table-column>
        <el-table-column prop="end_date" label="Дата окончания" width="150"
            ><template #default="scope">
                {{ formatDate(scope.row.end_date) }}
            </template></el-table-column
        >
        <el-table-column prop="total_price" label="Стоимость" width="120">
            <template #default="scope">
                {{ scope.row.total_price }}
            </template>
        </el-table-column>
        <el-table-column prop="status" label="Статус" width="140">
            <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                    {{ getStatusLabel(scope.row.status) }}
                </el-tag>
            </template>
        </el-table-column>
        <el-table-column label="Операции" width="120" fixed="right">
            <template #default="scope">
                <el-button
                    class="operation-button"
                    type="info"
                    icon="EditPen"
                    tag="router-link"
                    :to="`bookings/${scope.row.id}/edit`"
                ></el-button>
                <el-button
                    class="operation-button"
                    type="danger"
                    icon="Delete"
                    @click="deleteBooking(scope.row.id)"
                ></el-button>
            </template>
        </el-table-column>
    </el-table>

    <div class="pagination">
        <el-pagination
            background
            layout="prev, pager, next, jumper"
            :total="totalBookings"
            :page-size="pageSize"
            @current-change="handleCurrentChange"
        />
    </div>
</template>

<script setup lang="ts">
import { useApi } from "@/composables/useApi";
import { ElMessage, ElMessageBox } from "element-plus";
import { computed, onMounted, reactive, ref } from "vue";
import type {
    Booking,
    Animal,
    AnimalType,
    Client,
    Hotel,
    Pricing,
} from "@/types/types";

onMounted(async () => {
    await getBookingData();
    await getClientsData();
    await getAnimalsData();
    await getAnimalTypesData();
    await getHotelsData();
    await getPricingData();
});

const size = "large";
const pageSize = 10;
const currentPage = ref(1);

// Данные из API
const bookingsData = ref<Booking[]>([]);
const clientsData = ref<Client[]>([]);
const animalsData = ref<Animal[]>([]);
const animalTypesData = ref<AnimalType[]>([]);
const hotelsData = ref<Hotel[]>([]);
const pricingData = ref<Pricing[]>([]);

// Статусы бронирований
const bookingStatuses = [
    { value: "confirmed", label: "Подтверждено" },
    { value: "pending", label: "В ожидании" },
    { value: "cancelled", label: "Отклонено" },
];

// Опции фильтрации
interface FilterOptions {
    client: string;
    animal_type: string | null;
    status: string | null;
    dateRange: [string, string] | null;
}

const filterOptions = reactive<FilterOptions>({
    client: "",
    animal_type: null,
    status: null,
    dateRange: null,
});

// Подсчет общего количества бронирований
const totalBookings = computed(() => bookingsData.value.length);

// Отфильтрованные бронирования
const filteredBookings = computed(() => {
    return bookingsData.value
        .filter((booking) => {
            const clientFullName = getClientFullName(
                booking.client_id
            ).toLowerCase();
            const animalTypeMatch =
                !filterOptions.animal_type ||
                getAnimalType(booking.animal_id) === filterOptions.animal_type;
            const statusMatch =
                !filterOptions.status ||
                booking.status === filterOptions.status;
            const clientMatch =
                !filterOptions.client ||
                clientFullName.includes(filterOptions.client.toLowerCase());

            let dateMatch = true;
            if (filterOptions.dateRange) {
                const [startFilter, endFilter] = filterOptions.dateRange;
                const bookingStart = new Date(booking.start_date);
                const bookingEnd = new Date(booking.end_date);
                const filterStart = new Date(
                    startFilter.split("-").reverse().join("-")
                );
                const filterEnd = new Date(
                    endFilter.split("-").reverse().join("-")
                );

                dateMatch =
                    (bookingStart >= filterStart &&
                        bookingStart <= filterEnd) ||
                    (bookingEnd >= filterStart && bookingEnd <= filterEnd) ||
                    (bookingStart <= filterStart && bookingEnd >= filterEnd);
            }

            return clientMatch && animalTypeMatch && statusMatch && dateMatch;
        })
        .slice(
            (currentPage.value - 1) * pageSize,
            currentPage.value * pageSize
        );
});

// Функции получения данных через API
async function getBookingData() {
    try {
        const response = await useApi<Booking[]>("/bookings");
        bookingsData.value = response.data;
    } catch (error) {
        console.error("Ошибка загрузки данных бронирований:", error);
    }
}

async function getClientsData() {
    try {
        const response = await useApi<Client[]>("/clients");
        clientsData.value = response.data;
    } catch (error) {
        console.error("Ошибка загрузки данных клиентов:", error);
    }
}

async function getAnimalsData() {
    try {
        const response = await useApi<Animal[]>("/animals");
        animalsData.value = response.data;
    } catch (error) {
        console.error("Ошибка загрузки данных животных:", error);
    }
}

async function getAnimalTypesData() {
    try {
        const response = await useApi<AnimalType[]>("/animal_types");
        animalTypesData.value = response.data;
    } catch (error) {
        console.error("Ошибка загрузки типов животных:", error);
    }
}

async function getHotelsData() {
    try {
        const response = await useApi<Hotel[]>("/hotels");
        hotelsData.value = response.data;
    } catch (error) {
        console.error("Ошибка загрузки данных отелей:", error);
    }
}

async function getPricingData() {
    try {
        const response = await useApi<Pricing[]>("/pricing");
        pricingData.value = response.data;
    } catch (error) {
        console.error("Ошибка загрузки данных тарифов:", error);
    }
}

// Вспомогательные функции для форматирования данных
function getClientFullName(clientId: number): string {
    const client = clientsData.value.find((c) => c.id === clientId);
    if (client) {
        return `${client.last_name} ${client.first_name}`;
    }
    return "Клиент не найден";
}

function getAnimalName(animalIds: number[]): string {
    const animalNames: string[] = [];
    animalIds.forEach((id) => {
        animalNames.push(animalsData.value.find((a) => a.id === id)?.name);
    });

    return animalNames ? animalNames.join(", ") : "Животное не найдено";
}

function getPricingName(pricingId: number): string {
    const pricing = pricingData.value.find((p) => p.id === pricingId);
    return pricing ? pricing.name : "Тариф не найден";
}

function getAnimalType(animalIds: number[]): string {
    const animalTypeNames: string[] = [];
    animalIds.forEach((id) => {
        const animal = animalsData.value.find((a) => a.id === id);
        if (animal) {
            const animalType = animalTypesData.value.find(
                (t) => t.id === animal.animal_type_id
            );
            animalType
                ? animalTypeNames.push(animalType.name)
                : "Тип не найден";
        }
    });
    return animalTypeNames.join(", ");
}

function getStatusLabel(status: string): string {
    const statusObj = bookingStatuses.find((s) => s.value === status);
    return statusObj ? statusObj.label : status;
}

function getStatusType(status: string): string {
    switch (status) {
        case "confirmed":
            return "success";
        case "pending":
            return "warning";
        case "cancelled":
            return "danger";
        default:
            return "info";
    }
}

function formatDate(input: string): string {
    const date = new Date(input);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Месяцы с 0
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
}

// Функция для удаления бронирования
function deleteBooking(id: number) {
    ElMessageBox.confirm(
        "Вы уверены, что хотите удалить бронирование?",
        "Подтвердите удаление",
        {
            cancelButtonText: "Отмена",
            confirmButtonText: "Удалить",
            type: "warning",
        }
    ).then(async () => {
        try {
            await useApi<any>(`/bookings/${id}`, {
                method: "DELETE",
            });

            // Удаляем бронирование из локального массива
            const index = bookingsData.value.findIndex((b) => b.id === id);
            if (index !== -1) {
                bookingsData.value.splice(index, 1);
            }

            ElMessage({
                type: "success",
                message: "Бронирование удалено",
                offset: 48,
            });
        } catch (error) {
            console.error("Ошибка удаления бронирования:", error);
            ElMessage({
                type: "error",
                message: "Ошибка при удалении бронирования",
                offset: 48,
            });
        }
    });
}

// Сброс фильтров
function resetFilters() {
    filterOptions.client = "";
    filterOptions.animal_type = null;
    filterOptions.status = null;
    filterOptions.dateRange = null;
}

// Обработка пагинации
function handleCurrentChange(val: number) {
    currentPage.value = val;
}
</script>

<style lang="scss" scoped>
.page-header {
    margin-bottom: 16px;
}

.filters-container {
    margin-top: 16px;
    margin-bottom: 20px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .filters-item {
        flex-grow: 1;
    }
}

.table-view-buttons {
    margin-bottom: 20px;
}

.search {
    width: 270px;
}

.animal-type-select {
    width: 160px;
}

.status-select {
    width: 160px;
}

.table {
    margin-bottom: 20px;
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
</style>
