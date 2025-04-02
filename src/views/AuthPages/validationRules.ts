import type { FormRules } from "element-plus";

const validationRules: FormRules = {
    firstName: [
        {
            required: true,
            message: "Введите имя",
            trigger: "blur",
        },
    ],
    lastName: [
        {
            required: true,
            message: "Введите фамилию",
            trigger: "blur",
        },
    ],
    login: [
        {
            required: true,
            message: "Введите логин",
            trigger: "blur",
        },
        { min: 5, message: "Длина логина от 5 символов", trigger: "blur" },
    ],
    password: [
        {
            required: true,
            message: "Введите пароль",
            trigger: "blur",
        },
        { min: 5, message: "Длина пароля от 5 символов", trigger: "blur" },
    ],
    phone: [
        {
            required: true,
            message: "Введите пароль",
            trigger: "blur",
        },
        {
            len: 15,
            message: "Введите корректный номер телефона",
            trigger: "blur",
        },
    ],
    email: [
        {
            required: true,
            message: "Введите email",
            trigger: "blur",
        },
        { type: "email", message: "Введите корректный email", trigger: "blur" },
    ],
};

export default validationRules;
