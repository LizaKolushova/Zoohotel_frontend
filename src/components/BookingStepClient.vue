<template>
    <div class="inputs-container">
        <el-select
            class="client-select"
            v-model="selectedClientId"
            filterable
            :suffix-icon="Search"
            placeholder="Поиск клиента по ФИО"
            no-match-text="Клиентов не найдено"
            size="large"
            clearable
            @change="clientFormOpened = false"
        >
            <el-option
                v-for="client in bookingStore.clientsData"
                :key="client.id"
                :label="getFullName(client)"
                :value="client.id"
            >
                {{ getFullName(client) }}
            </el-option>
        </el-select>

        <el-button
            class="add-client-button"
            size="large"
            v-if="!clientFormOpened"
            @click="
                openClientForm(0);
                selectedClientId = undefined;
            "
        >
            Добавить клиента
            <el-icon type="primary" class="add-icon">
                <Plus />
            </el-icon>
        </el-button>
    </div>

    <ClientForm
        v-if="clientFormOpened"
        :is-editing="clientFormIsEditing"
        :client-id="clientFormClientId"
        @complete="handleClientFormComplete"
        @cancel="clientFormOpened = false"
    ></ClientForm>
    <div
        class="client-info-container"
        v-if="selectedClient && !clientFormOpened"
    >
        <el-descriptions :column="1" border label-width="140">
            <template #title
                ><h4 class="description-header">
                    Информация о клиенте
                </h4></template
            >
            <el-descriptions-item label="Фамилия">{{
                selectedClient.last_name
            }}</el-descriptions-item>
            <el-descriptions-item label="Имя">{{
                selectedClient.first_name
            }}</el-descriptions-item>
            <el-descriptions-item label="Отчество">{{
                selectedClient.middle_name
            }}</el-descriptions-item>
            <el-descriptions-item label="E-mail">{{
                selectedClient.email
            }}</el-descriptions-item>
            <el-descriptions-item label="Телефон">{{
                selectedClient.phone
            }}</el-descriptions-item>
        </el-descriptions>
        <div class="client-buttons-container">
            <el-button @click="openClientForm(selectedClient?.id)" size="large">
                Редактировать
            </el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import ClientForm from "./ClientForm.vue";
import { Search, Plus } from "@element-plus/icons-vue";
import type { Client } from "@/types/types";
import { computed, onMounted, ref, watch } from "vue";
import { useBookingStore } from "@/stores/bookingStore";

const bookingStore = useBookingStore();

const selectedClientId = ref<number | undefined>();
const selectedClient = computed(() => {
    return bookingStore.clientsData.find(
        (c) => c.id === selectedClientId.value
    );
});

const clientFormOpened = ref(false);
const clientFormClientId = ref<number>();
const clientFormIsEditing = ref(false);

function openClientForm(clientId: number | undefined) {
    clientFormOpened.value = true;
    clientFormClientId.value = clientId;
    clientFormIsEditing.value = clientId !== 0;
}

function handleClientFormComplete(clientId: number) {
    clientFormOpened.value = false;
    // Обновляем список клиентов
    bookingStore.loadClients().then(() => {
        // После обновления списка выбираем добавленного/отредактированного клиента
        selectedClientId.value = clientId;
    });
}

const getFullName = (client: Client): string => {
    return `${client.last_name} ${client.first_name} ${
        client.middle_name || ""
    }`.trim();
};

onMounted(() => {
    if (bookingStore.selectedClient) {
        selectedClientId.value = bookingStore.selectedClient.id;
    }
});

// Следим за изменением выбранного клиента и обновляем хранилище
watch(selectedClient, (newClient) => {
    bookingStore.setClient(newClient);
});

watch(
    () => bookingStore.selectedClient,
    (newClient) => {
        selectedClientId.value = newClient?.id;
    }
);
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

    .client-select {
        flex: 1 1 100%;
        @media (max-width: 650px) {
            max-width: 100%;
        }
    }

    .add-client-button {
        max-width: 200px;
        flex: 1 1 100%;

        @media (max-width: 650px) {
            max-width: 100%;
        }
    }
}

.client-info-container {
    max-width: 500px;
    margin-top: 36px;
}

.description-header {
    margin-bottom: 16px;
    display: block;
    font-size: 18px;
    font-weight: 500;
}

.client-buttons-container {
    margin-top: 16px;
}
</style>
