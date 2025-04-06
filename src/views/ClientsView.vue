<template>
    <h2 class="page-header">Клиенты</h2>

    <div class="filters-container">
        <el-button
            class="add-button filters-item"
            type="primary"
            :size="size"
            tag="router-link"
            to="/clients/create"
            >Новый клиент</el-button
        >
        <el-input
            class="search filters-item"
            :prefix-icon="'search'"
            clearable
            placeholder="Поиск животного"
            :size="size"
            v-model="searchFilter"
        ></el-input>
    </div>

    <el-table class="table" :data="filteredClients" stripe>
        <el-table-column type="selection" width="55" />
        <el-table-column
            prop="name"
            label="ФИО"
            :formatter="FIOFormatter"
            width="340"
        />
        <el-table-column prop="phone" label="Номер телефона" width="260" />
        <el-table-column prop="email" label="E-mail" width="280" />
        <el-table-column
            label="Кол-во питомцев"
            width="180"
            :formatter="petsCountFormatter"
        />
        <el-table-column label="Операции" width="160" fixed="right">
            <template #default="scope">
                <el-button
                    class="operation-button"
                    type="primary"
                    icon="Calendar"
                ></el-button>
                <el-button
                    class="operation-button"
                    type="info"
                    icon="EditPen"
                    tag="router-link"
                    :to="`/clients/${scope.row.id}/edit`"
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
</template>

<script setup lang="ts">
import { useApi } from "@/composables/useApi";
import type { Client, Animal } from "@/types/types";
import { error } from "console";
import { ElMessage, ElMessageBox } from "element-plus";
import { computed, onMounted, ref } from "vue";

const size = "large";

onMounted(async () => {
    await getClientsData();
    await getAnimalsData();
    console.log(animalsData.value);
});

const searchFilter = ref<string>("");
const clientsData = ref<Client[]>([]);
const animalsData = ref<Animal[]>([]);
const filteredClients = computed(() => {
    return clientsData.value.filter((client) => {
        return (
            !searchFilter.value ||
            FIOFormatter(client)
                .toLowerCase()
                .includes(searchFilter.value.toLowerCase())
        );
    });
});

async function getAnimalsData() {
    try {
        const response = await useApi<Animal[]>("/animals");
        animalsData.value = response.data;
    } catch (error) {
        console.error("Ошибка загрузки данных:", error);
    }
}

async function getClientsData() {
    try {
        const response = await useApi<Client[]>("/clients");
        clientsData.value = response.data;
    } catch (error) {
        console.error("Ошибка загрузки данных:", error);
    }
}

function FIOFormatter(client: Client) {
    return `${client.last_name} ${client.first_name} ${client.middle_name}`;
}

function petsCountFormatter(client: Client) {
    animalsData.value.filter((element) => {
        return element.client_id === client.id;
    });
    return animalsData.value.filter((element) => {
        return element.client_id === client.id;
    }).length;
}

function deleteAnimal(id: number) {
    const deletingIndex = clientsData.value.findIndex((element) => {
        return element.id === id;
    });
    ElMessageBox.confirm(
        "Вы уверены, что хотите удалить данные о клиенте (будет удалена информация о всех его питомцах)?",
        "Подтвердите удаление",
        {
            cancelButtonText: "Отмена",
            confirmButtonText: "Удалить",
            type: "warning",
        }
    ).then(async () => {
        const response = await useApi<{ message: string }>(
            "/clients/" + `${id}`,
            {
                method: "delete",
            }
        );
        if (response.error) {
            ElMessage({
                type: "error",
                message: response.error,
                offset: 48,
            });
        } else {
            clientsData.value.splice(deletingIndex, 1);
            ElMessage({
                type: "success",
                message: response.data.message,
                offset: 48,
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
}

.search {
    max-width: 270px;
}

.add-button {
    max-width: 140px;
}

.operation-button {
    width: 40px;
    height: 24px;
    & + .operation-button {
        margin-left: 8px;
    }
}
</style>
