// src/stores/bookingStore.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type {
    Client,
    Animal,
    Pricing,
    AnimalType,
    Restriction,
    Booking,
} from "@/types/types";
import { useApi } from "@/composables/useApi";
import { ElMessage } from "element-plus";

export interface BookingFormData {
    start_date: string;
    end_date: string;
    status: "pending" | "declined" | "confirmed";
    pricing_id: number;
}

export const useBookingStore = defineStore("booking", () => {
    // State
    const selectedClient = ref<Client | undefined>(undefined);
    const selectedPets = ref<Animal[]>([]);
    const formData = ref<BookingFormData>({
        start_date: "",
        end_date: "",
        status: "pending",
        pricing_id: 1,
    });
    const active = ref(0);

    // Data lists
    const clientsData = ref<Client[]>([]);
    const animalsData = ref<Animal[]>([]);
    const animalTypesData = ref<AnimalType[]>([]);
    const pricingsData = ref<Pricing[]>([]);
    const restrictionsData = ref<Restriction[]>([]);
    const bookingsData = ref<Booking[]>([]);
    const editBookingId = ref<number>(0);

    // Getters
    const clientAnimals = computed(() => {
        if (!selectedClient.value) return [];
        return animalsData.value.filter(
            (animal) => animal.client_id === selectedClient.value?.id
        );
    });

    // Actions
    function setClient(client: Client | undefined) {
        selectedClient.value = client;
        // Reset selected pets when client changes
        if (
            selectedPets.value.length > 0 &&
            selectedPets.value[0].client_id !== client?.id
        ) {
            selectedPets.value = [];
        }
    }

    function setPets(pets: Animal[]) {
        selectedPets.value = pets;
    }

    function setFormData(data: BookingFormData) {
        formData.value = data;
    }

    function nextStep() {
        if (active.value < 2) {
            active.value++;
        }
    }

    function prevStep() {
        if (active.value > 0) {
            active.value--;
        }
    }

    function resetForm() {
        selectedClient.value = undefined;
        selectedPets.value = [];
        formData.value = {
            start_date: "",
            end_date: "",
            status: "pending",
            pricing_id: 1,
        };
        active.value = 0;
    }

    // API calls
    async function loadClients() {
        try {
            const response = await useApi<Client[]>("/clients");
            clientsData.value = response.data;
        } catch (error) {
            ElMessage({
                type: "error",
                message: "Не удалось загрузить список клиентов",
                offset: 48,
            });
        }
    }

    async function loadAnimals() {
        try {
            const response = await useApi<Animal[]>("/animals");
            animalsData.value = response.data;
        } catch (error) {
            ElMessage({
                type: "error",
                message: "Не удалось загрузить список животных",
                offset: 48,
            });
        }
    }

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

    async function loadPricings() {
        try {
            const response = await useApi<Pricing[]>("/pricing");
            pricingsData.value = response.data;
        } catch (error) {
            ElMessage({
                type: "error",
                message: "Не удалось загрузить список размещений",
                offset: 48,
            });
        }
    }

    async function loadRestrictions() {
        try {
            const response = await useApi<Restriction[]>("/restrictions");
            restrictionsData.value = response.data;
        } catch (error) {
            ElMessage({
                type: "error",
                message: "Не удалось загрузить список ограничений",
                offset: 48,
            });
        }
    }

    async function loadBookings() {
        try {
            const response = await useApi<Booking[]>("/bookings");
            bookingsData.value = response.data;
        } catch (error) {
            ElMessage({
                type: "error",
                message: "Не удалось загрузить список бронирований",
                offset: 48,
            });
        }
    }

    async function createBooking() {
        try {
            if (
                !selectedClient.value ||
                selectedPets.value.length === 0 ||
                !formData.value
            ) {
                ElMessage({
                    type: "error",
                    message: "Недостаточно данных для создания бронирования",
                    offset: 48,
                });
                return false;
            }

            const start = new Date(formData.value.start_date);
            const end = new Date(formData.value.end_date);

            const diffMs = end.getTime() - start.getTime();
            let diffDays = diffMs / (1000 * 60 * 60 * 24);
            diffDays = Math.ceil(diffDays);

            const pricing = pricingsData.value.find(
                (p) => p.id === formData.value.pricing_id
            );

            const sendingData = {
                id: editBookingId.value,
                client_id: selectedClient.value.id,
                animal_id: selectedPets.value.map((pet) => pet.id),
                hotel_id: 1,
                pricing_id: formData.value.pricing_id,
                start_date: formData.value.start_date,
                end_date: formData.value.end_date,
                status: formData.value.status,
                total_price: diffDays * (pricing?.price || 0),
            };

            const response = await useApi<{ message: string }>("/bookings", {
                method: "post",
                data: sendingData,
            });

            if (response.data.status === 400) {
                ElMessage({
                    type: "error",
                    message: response.error,
                    offset: 48,
                });
                return false;
            } else {
                ElMessage({
                    type: "success",
                    message: response.data.message,
                    offset: 48,
                });
                return true;
            }
        } catch (error) {
            ElMessage({
                type: "error",
                message: "Не удалось создать бронирование",
                offset: 48,
            });
            return false;
        }
    }

    async function loadBookingById(id: number) {
        try {
            await Promise.all([loadClients(), loadAnimals(), loadBookings()]);

            const booking = bookingsData.value.find((b) => b.id === id);
            if (!booking) return false;
            editBookingId.value = booking.id;
            selectedClient.value = clientsData.value.find(
                (c) => c.id === booking.client_id
            );

            selectedPets.value = booking.animal_id
                .map((id) =>
                    animalsData.value.find((animal) => animal.id === id)
                )
                .filter((animal): animal is Animal => animal !== undefined);

            formData.value = {
                start_date: booking.start_date,
                end_date: booking.end_date,
                status: booking.status as "pending" | "declined" | "confirmed",
                pricing_id: booking.pricing_id,
            };

            return true;
        } catch (error) {
            ElMessage({
                type: "error",
                message: "Не удалось загрузить данные бронирования",
                offset: 48,
            });
            return false;
        }
    }

    function getRestrictionAnimalById(id: number): string {
        const restriction = restrictionsData.value.find((r) => r.id === id);
        if (!restriction) return "Неизвестно";

        const animalType = animalTypesData.value.find(
            (a) => a.id === restriction.animal_type_id
        );
        return animalType?.name || "Неизвестно";
    }

    function getAnimalTypeName(typeId: number): string {
        const type = animalTypesData.value.find((t) => t.id === typeId);
        return type ? type.name : "Неизвестный тип";
    }

    // Инициализация хранилища
    async function initStore() {
        editBookingId.value = 0;
        await Promise.all([
            loadClients(),
            loadAnimals(),
            loadAnimalTypes(),
            loadPricings(),
            loadRestrictions(),
            loadBookings(),
        ]);
    }

    return {
        // State
        selectedClient,
        selectedPets,
        formData,
        active,
        clientsData,
        animalsData,
        animalTypesData,
        pricingsData,
        restrictionsData,
        bookingsData,

        // Getters
        clientAnimals,

        // Actions
        setClient,
        setPets,
        setFormData,
        nextStep,
        prevStep,
        resetForm,
        loadClients,
        loadAnimals,
        loadAnimalTypes,
        loadPricings,
        loadRestrictions,
        loadBookings,
        createBooking,
        loadBookingById,
        getRestrictionAnimalById,
        getAnimalTypeName,
        initStore,
    };
});
