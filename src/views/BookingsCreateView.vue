<template>
    <h2 class="page-header">
        {{ route.params.id ? "Редактирование брони" : "Новое бронирование" }}
    </h2>
    <div class="page-container">
        <el-steps class="steps" :active="bookingStore.active">
            <el-step title="Клиент" />
            <el-step title="Питомцы" />
            <el-step title="Бронирование" />
        </el-steps>

        <div class="step-container">
            <BookingStepClient
                v-if="bookingStore.active == 0"
            ></BookingStepClient>

            <BookingStepAnimals
                v-if="bookingStore.active == 1 && bookingStore.selectedClient"
            ></BookingStepAnimals>

            <BookingStepInfo v-if="bookingStore.active == 2"></BookingStepInfo>

            <div class="step-buttons-container">
                <el-button
                    size="large"
                    @click="bookingStore.prevStep()"
                    :disabled="bookingStore.active == 0"
                >
                    Назад
                </el-button>
                <el-button
                    v-if="bookingStore.active == 0"
                    type="primary"
                    size="large"
                    :disabled="bookingStore.selectedClient == undefined"
                    @click="bookingStore.nextStep()"
                >
                    Далее
                </el-button>
                <el-button
                    v-if="bookingStore.active == 1"
                    type="primary"
                    size="large"
                    :disabled="bookingStore.selectedPets.length === 0"
                    @click="bookingStore.nextStep()"
                >
                    Далее
                </el-button>
                <el-button
                    v-if="bookingStore.active == 2"
                    type="primary"
                    size="large"
                    @click="onSubmit"
                >
                    {{ route.params.id ? "Сохранить" : "Создать бронирование" }}
                </el-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import BookingStepClient from "@/components/BookingStepClient.vue";
import BookingStepAnimals from "@/components/BookingStepAnimals.vue";
import BookingStepInfo from "@/components/BookingStepInfo.vue";
import { onBeforeMount } from "vue";
import { useRoute } from "vue-router";
import router from "@/router";
import { useBookingStore } from "@/stores/bookingStore";

const route = useRoute();
const bookingStore = useBookingStore();

async function onSubmit() {
    const success = await bookingStore.createBooking();
    if (success) {
        router.push("/bookings");
    }
}

onBeforeMount(async () => {
    await bookingStore.initStore();
    bookingStore.resetForm();
    if (route.params.id) {
        await bookingStore.loadBookingById(+route.params.id);
    }
});
</script>

<style lang="scss" scoped>
.steps {
    max-width: 600px;
    margin-top: 16px;
}

.step-buttons-container {
    margin-top: 16px;
    display: flex;
    justify-content: space-between;
    width: 100%;
}

.step-button {
    font-size: 24px;
    --el-fill-color-light: transparent;
    --el-fill-color: transparent;
    &:hover {
        color: var(--el-color-primary);
    }
}
</style>
