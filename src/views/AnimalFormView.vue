<template>
    <div>
        <h2 class="page-header">
            {{
                isEditing ? "Редактирование животного" : "Добавление животного"
            }}
        </h2>
        <AnimalForm
            :is-editing="isEditing"
            :animal-id="animalId"
            :client-id="clientId"
            @complete="router.push('/animals')"
            @cancel="router.back()"
        ></AnimalForm>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import AnimalForm from "@/components/AnimalForm.vue";

const clientId = computed(() => +route.query.clientId);
const route = useRoute();
const router = useRouter();

const isEditing = ref(!!route.params.id);
const animalId = ref(+route.params.id);
</script>

<style scoped>
.buttons {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
}
</style>
