<template>
    <div>
        <h2 class="page-header">
            {{
                isEditing
                    ? "Редактирование пасспорта животного"
                    : "Добавление пасспорта животного"
            }}
        </h2>
        <AnimalPassportForm
            :is-editing="isEditing"
            @complete="router.push('/animals')"
        ></AnimalPassportForm>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import AnimalPassportForm from "@/components/AnimalPassportForm.vue";

const route = useRoute();
const router = useRouter();

const isEditing = ref(!!route.params.id);
</script>

<style scoped>
.buttons {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
}
</style>
