<template>
    <HeaderComponent></HeaderComponent>
    <el-main>
        <div class="wrapper">
            <RouterView></RouterView>
        </div>
    </el-main>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
import HeaderComponent from "@/components/HeaderComponent.vue";
</script>

<style lang="scss" scoped></style>
