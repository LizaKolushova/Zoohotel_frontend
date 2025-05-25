<template>
    <el-form class="form" label-position="top" :model="form" :rules="rules">
        <el-form-item size="large" label="Дата заезда" prop="start_date">
            <el-date-picker
                value-format="YYYY-MM-DDTHH:mm:ss"
                v-model="form.start_date"
                type="datetime"
                placeholder="Дата начала брони"
            />
        </el-form-item>
        <el-form-item size="large" label="Дата выезда" prop="end_date">
            <el-date-picker
                value-format="YYYY-MM-DDTHH:mm:ss"
                v-model="form.end_date"
                type="datetime"
                placeholder="Дата выезда"
            />
        </el-form-item>
        <el-form-item size="large" label="Статус">
            <el-select v-model="form.status">
                <el-option
                    v-for="status in statuses"
                    :key="status.en"
                    :label="status.ru"
                    :value="status.en"
                >
                </el-option>
            </el-select>
        </el-form-item>
        <el-form-item size="large" label="Тип размещения">
            <el-select v-model="form.pricing_id">
                <el-option
                    v-for="pricing in bookingStore.pricingsData"
                    :key="pricing.id"
                    :label="pricing.name"
                    :value="pricing.id"
                >
                    <span>{{ pricing.name }}</span>
                    <el-tag style="margin-left: 8px">{{
                        bookingStore.getRestrictionAnimalById(
                            pricing.restriction_id
                        )
                    }}</el-tag>
                    <el-tag style="margin-left: 8px"
                        >{{ pricing.price }} руб.</el-tag
                    >
                </el-option>
            </el-select>
        </el-form-item>
    </el-form>
</template>

<script setup lang="ts">
import { useBookingStore } from "@/stores/bookingStore";
import { reactive, ref, watch } from "vue";
import type { FormRules } from "element-plus";

const bookingStore = useBookingStore();

const statuses = [
    { ru: "В ожидании", en: "pending" },
    { ru: "Подтвержен", en: "confirmed" },
    { ru: "Отменен", en: "declined" },
];

// Используем форму из store
const form = ref(bookingStore.formData);

const rules = reactive<FormRules>({
    start_date: {
        required: true,
        message: "Введите дату заезда",
        trigger: "blur",
    },
    end_date: {
        required: true,
        message: "Введите дату выезда",
        trigger: "blur",
    },
});

// Следим за изменениями формы и обновляем данные в store
watch(
    form,
    (newFormData) => {
        bookingStore.setFormData(newFormData);
    },
    { deep: true }
);
</script>

<style scoped>
.form {
    margin-top: 36px;
    max-width: 600px;
}
</style>
