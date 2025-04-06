import { Gender } from "./enums";

interface Animal {
    id: number;
    name: string;
    animal_type_id: number;
    client_id: number;
    breed: string;
    gender: Gender;
    weight: number;
    color: string;
    birth_date: string;
    description: string;
    sterilized: boolean;
}

interface AnimalType {
    id: number;
    name: string;
}

interface Client {
    id: number;
    last_name: string;
    first_name: string;
    middle_name: string;
    phone: string;
    email: string;
}

export type { Animal, AnimalType, Client };
