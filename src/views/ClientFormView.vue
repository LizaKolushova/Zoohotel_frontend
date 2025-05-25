<template>
    <div>
        <h2 class="page-header">
            {{ isEditing ? "Редактирование клиента" : "Добавление клиента" }}
        </h2>
        <ClientForm
            :is-editing="isEditing"
            @complete="router.push('/clients')"
            @cancel="router.back()"
            :client-id="clientId"
        ></ClientForm>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import ClientForm from "@/components/ClientForm.vue";

const route = useRoute();
const router = useRouter();

const clientId = ref(+route.params.id);
const isEditing = ref(!!route.params.id);
</script>

<style scoped>
.buttons {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
}
</style>
