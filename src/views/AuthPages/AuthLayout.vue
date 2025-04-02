<template>
    <HeaderComponent></HeaderComponent>
    <el-main>
        <div class="wrapper">
            <el-card class="auth-card"><RouterView></RouterView></el-card>
        </div>
    </el-main>
</template>

<script setup>
import { RouterView } from "vue-router";
import HeaderComponent from "@/components/HeaderComponent.vue";
</script>

<style lang="scss">
.auth-card {
    max-width: 480px;
    margin: 0 auto;
}
</style>
