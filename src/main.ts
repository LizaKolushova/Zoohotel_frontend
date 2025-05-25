import "@/assets/reset.css";
import "element-plus/dist/index.css";
import "@/assets/index.css";
import { createApp } from "vue";
import { createPinia } from "pinia";
import { registerSW } from "virtual:pwa-register";

// Регистрация service worker с функцией обновления
const updateSW = registerSW({
    onNeedRefresh() {
        // Можно показать уведомление для пользователя о доступном обновлении
        console.log("Доступно обновление!");
    },
    onOfflineReady() {
        // Уведомление о том, что приложение готово к офлайн-использованию
        console.log("Приложение готово к работе офлайн");
    },
});
import App from "./App.vue";
import router from "./router";
import ElementPlus from "element-plus";

import * as ElementPlusIconsVue from "@element-plus/icons-vue";

const app = createApp(App);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}
app.use(ElementPlus);
app.use(createPinia());
app.use(router);

app.mount("#app");
