<template>
    <div class="container">
        <el-row size="large" class="buttons-row">
            <el-button
                type="primary"
                size="large"
                tag="router-link"
                to="bookings/create"
                >Новая бронь</el-button
            >
            <el-button size="large" tag="router-link" to="clients/create"
                >Новый клиент</el-button
            >
            <el-button size="large" tag="router-link" to="animals/create"
                >Новое животное</el-button
            >
        </el-row>

        <el-row class="filter-row">
            <el-input
                placeholder="Поиск"
                v-model="search"
                clearable
                class="filter-item search"
                size="large"
            />
            <div class="date-picker-container">
                <el-date-picker
                    size="large"
                    class="date-picker filter-item"
                    v-model="selectedDate"
                    @change="zoomToDate(selectedDate)"
                    width="80px"
                >
                </el-date-picker>
            </div>

            <el-select
                size="large"
                class="filter-item select"
                v-model="placementType"
                placeholder="Тип размещения"
                clearable
            >
                <el-option
                    v-for="type in placementTypes"
                    :key="type"
                    :label="type"
                    :value="type"
                >
                    {{ type }}
                </el-option>
            </el-select>
            <el-select
                size="large"
                class="filter-item select"
                v-model="animalType"
                placeholder="Тип животного"
                clearable
            >
                <el-option
                    v-for="type in animalTypes"
                    :key="type.id"
                    :label="type.name"
                    :value="type.name"
                />
            </el-select>
            <el-button size="large" @click="zoomIn">+</el-button>
            <el-button size="large" @click="zoomOut">-</el-button>
        </el-row>

        <div id="ghanttContainer" class="ghantt-container"></div>
    </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, computed } from "vue";
import anychart from "anychart";
import { start } from "repl";
import { id } from "element-plus/es/locales.mjs";
import { useApi } from "@/composables/useApi";
import type { AnimalType } from "@/types/types";

const search = ref("");
const selectedDate = ref(new Date());
const placementType = ref("");
const animalType = ref("");

const placementTypes = ["Стандарт", "Медиум", "Двухместный"];
const animalTypes = ref<AnimalType[]>();

const roomColors = {
    Стандарт: "#E0F7FA",
    Медиум: "#F3E5F5",
    Двухместный: "#FFF9C4",
};

let data: any;

const getRoomType = (roomName: string) => {
    if (roomName.includes("Стандарт")) return "Стандарт";
    if (roomName.includes("Медиум")) return "Медиум";
    if (roomName.includes("Двухместный")) return "Двухместный";
    return "Другое";
};

let treeDataUsed: any;
let treeData: any;
let chart: any;

function deepClone(obj: any) {
    return JSON.parse(JSON.stringify(obj));
}

function filterTreeData() {
    const filtered = deepClone(data).filter((item: any) => {
        const roomType = getRoomType(item.name);
        const matchesPlacement =
            !placementType.value || roomType === placementType.value;

        const matchesType =
            !animalType.value || item.restriction === animalType.value;
        return matchesPlacement && matchesType;
    });

    filtered.forEach((element) => {
        element.periods = deepClone(element.periods).filter((period) => {
            return (
                !search.value ||
                period.client.name
                    .toLowerCase()
                    .includes(search.value.toLowerCase())
            );
        });
    });
    treeDataUsed = anychart.data.tree(filtered, "as-table");
    chart.data(treeDataUsed);
}

const drawGantt = async () => {
    chart = anychart.ganttResource();
    treeData = anychart.data.tree(data, "as-table");
    treeDataUsed = anychart.data.tree(data, "as-table");
    chart.data(treeDataUsed);
    chart.container("ghanttContainer");
    chart.tooltip().enabled(false);
    chart.splitterPosition(200);
    chart.rowStroke({ thickness: 0 });
    chart.defaultRowHeight(30);
    chart.columnStroke({ thickness: 0 });
    chart.headerHeight(40);

    chart
        .getTimeline()
        .scale()
        .zoomLevels([
            [
                { unit: "hour", count: 1 },
                { unit: "day", count: 1 },
                { unit: "week", count: 1 },
            ],
        ]);

    // Настройка таблицы данных
    const dataGrid = chart.dataGrid();
    dataGrid.tooltip(false);
    dataGrid.column(0).enabled(false);
    dataGrid.headerFill("#F5F7FA");
    // Настройка первого столбца (с именем)
    const columnName = dataGrid.column(1);
    const columnTitle = columnName.title();
    columnTitle.text("Размещения");
    columnTitle.fontFamily("Inter");
    columnTitle.fontSize("18");
    columnTitle.fontWeight(700);
    columnName.width(200);

    const labels = columnName.labels();
    labels.useHtml(true);
    labels.format(function () {
        const name = this.name;
        let color = "#E0E0E0";
        if (name.includes("Стандарт")) color = roomColors["Стандарт"];
        if (name.includes("Медиум")) color = roomColors["Медиум"];
        if (name.includes("Двухместный")) color = roomColors["Двухместный"];
        return `<div style="background-color:${color}; height:100%; display:flex; align-items:center; justify-content: space-between; font-family: Inter; font-size: 12px; font-weight: 700; padding:5px 15px">
            <p>${name}</p>
            <p>${this.getData("restriction")}</p>
        </div>`;
    });
    const periods = chart.getTimeline().periods();
    periods.normal().fill("#F5F7FA");
    periods.normal().stroke("#EBEEF5");

    const tooltips = periods.tooltip();
    tooltips.background({ fill: "#ffffff" });

    tooltips.useHtml(true);
    tooltips.format(function (e) {
        return `<div style="font-family:Inter; font-size: 14px; display:flex; flex-direction: column; gap: 2px">
            <p><strong>Заезд:</strong> ${new Date(
                this.period.start
            ).toLocaleString()}</p>
                <p><strong>выезд:</strong> ${new Date(
                    this.period.end
                ).toLocaleString()}</p>
                <p><strong>Общая стоимость:</strong> ${this.period.price}</p>
                <p><strong>ID: ${this.period.id}</strong></p>
                <p style="margin-top:10px;"><strong>Хозяин:</strong> ${
                    this.period.client.name
                }</p>
                <p><strong>Телефон:</strong> ${this.period.client.phone}</p>
                <p><strong>Почта:</strong> ${this.period.client.email}</p>
                
             </div>`;
    });

    const periodLabels = chart.getTimeline().periods().labels();
    periodLabels.enabled(true);
    periodLabels.useHtml(true);
    periodLabels.format(function () {
        return `<span class='asdasdsa' style='text-align:left; color:#606266; font-family: Inter;font-size: 12px; font-weight: 700;'>${
            this.period.client.name
        } - ${this.period.animal.map((animal) => animal.name).join(", ")}</span>`;
    });

    const header = chart.getTimeline().header();
    header.background("#ffffff");
    header.stroke({ thickness: 0 });
    header.level(2).enabled(false);

    zoomIn.value = function () {
        chart.zoomIn(2);
    };

    zoomOut.value = function () {
        chart.zoomOut(2);
    };
    chart.interactivity().selectionMode("singleSelect");
    chart.interactivity().hoverMode("bySpot");
    chart.draw();
};

let zoomIn = ref<() => void>();

// zoom the timeline out
let zoomOut = ref<() => void>();

function zoomToDate(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    chart.zoomTo(startOfDay, endOfDay);
}
onMounted(async () => {
    const response = await useApi("/pricings_with_periods");
    data = response.data;
    drawGantt();

    const animalTypesData = await useApi<AnimalType[]>("/animal_types");
    animalTypes.value = animalTypesData.data;
    console.log(animalTypes.value);
});

watch([placementType, animalType, search], () => {
    filterTreeData();
});
</script>

<style lang="scss" scoped>
.ghantt-container {
    height: 500px;
    margin-top: 16px;
}

.buttons-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    max-width: 600px;

    .el-button {
        margin-left: 0;
        flex-grow: 1;
    }
}

.search {
    width: 270px;
}

.select {
    width: 160px;
}

.date-picker-container {
    max-width: 300px;
}

.filter-row {
    margin-top: 16px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .filter-item {
        flex-grow: 1;
    }

    .el-button {
        margin: 0;
    }
}
</style>
