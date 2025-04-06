import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { read, readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { Animal, AnimalType, Client } from "@/types/types";

// Тип JSON файла
interface ZoohotelData {
    animals: Animal[];
    animal_types: AnimalType[];
    clients: Client[];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;
const DATA_PATH = join(__dirname, "..", "data.json");

app.use(
    cors({
        origin: "http://localhost:5173", // или укажите точный адрес фронтенда, например: 'http://localhost:5173'
        methods: ["GET", "POST", "DELETE"],
        allowedHeaders: ["Content-Type"],
    })
);
app.use(bodyParser.json());

function deleteAnimal(id: number) {
    const animalData = readData().animals.filter(
        (animal: Animal) => animal.id !== id
    );
    const data = readData();
    data.animals = animalData;
    writeData(data);
}

function readData(): ZoohotelData {
    return JSON.parse(readFileSync(DATA_PATH, "utf8"));
}

function writeData(data: ZoohotelData): void {
    writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

app.get("/clients", (req: Request, res: Response) => {
    res.json(readData().clients);
});

app.get("/clients/:id", (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const clientData = readData().clients;
    const client = clientData.find((element) => element.id === id) || null;
    if (client) {
        res.json(client);
    } else {
        res.json({ message: "Запрашиваемого клиента не существует" });
    }
});

app.post("/clients", (req: Request, res: Response) => {
    const { id, last_name, first_name, middle_name, phone, email }: Client =
        req.body;
    const data = readData();
    const animalData = readData().animals;
    const clientsData = readData().clients;

    if (id) {
        const edittingClientIndex = clientsData.findIndex((element) => {
            return element.id === id;
        });
        clientsData[edittingClientIndex] = {
            id: id,
            last_name: last_name,
            first_name: first_name,
            middle_name: middle_name,
            phone: phone,
            email: email,
        };
        res.status(200).json({ message: "Данные о клиенте изменены" });
    } else {
        const appendingId = clientsData[clientsData.length - 1].id + 1;
        clientsData.push({
            id: appendingId,
            last_name: last_name,
            first_name: first_name,
            middle_name: middle_name,
            phone: phone,
            email: email,
        });
        res.status(200).json({ message: "Добавлено новый клиент" });
    }
    data.clients = clientsData;
    writeData(data);
});

app.delete("/clients/:id", (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const clientIndex = readData().clients.findIndex(
        (element: Client) => element.id === id
    );

    if (clientIndex === -1) {
        res.status(404).json({
            message: "Клиента с запрашиваемым id в системе нет",
        });
    }

    const clientsData = readData().clients.filter(
        (client: Client) => client.id !== id
    );
    const data = readData();
    data.clients = clientsData;
    data.animals = data.animals.filter((animal: Animal) => {
        return animal.client_id !== id;
    });
    writeData(data);
    res.status(200).json({ message: "Данные о клиенте удалены" });
});

app.get("/animals", (req: Request, res: Response) => {
    res.json(readData().animals);
});

app.get("/animals/:id", (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const animalData = readData().animals;
    const animal = animalData.find((element) => element.id === id) || null;
    if (animal) {
        res.json(animal);
    } else {
        res.json({ message: "Запрашиваемого животного не существует" });
    }
});

app.get("/animal_types", (req: Request, res: Response) => {
    res.json(readData().animal_types);
});

app.post("/animals", (req: Request, res: Response) => {
    const {
        id,
        name,
        animal_type_id,
        client_id,
        breed,
        gender,
        weight,
        color,
        birth_date,
        sterilized,
        description,
    }: Animal = req.body;
    const data = readData();
    const animalData = readData().animals;
    if (id) {
        const edittingAnimalIndex = animalData.findIndex((element) => {
            return element.id === id;
        });
        animalData[edittingAnimalIndex] = {
            id: id,
            name: name,
            animal_type_id: animal_type_id,
            client_id: client_id,
            breed: breed,
            gender: gender,
            weight: weight,
            color: color,
            birth_date: birth_date,
            description: description || "",
            sterilized: sterilized,
        };
        res.status(200).json({ message: "Данные о животном успешно изменены" });
    } else {
        const appendingId = animalData[animalData.length - 1].id + 1;
        animalData.push({
            id: appendingId,
            name: name,
            animal_type_id: animal_type_id,
            client_id: client_id,
            breed: breed,
            gender: gender,
            weight: weight,
            color: color,
            birth_date: birth_date,
            description: description || "",
            sterilized: sterilized,
        });
        res.status(200).json({ message: "Добавлено новое животное" });
    }
    data.animals = animalData;
    writeData(data);
});

app.delete("/animals/:id", (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    deleteAnimal(id);
    res.status(200).json({ message: "Продукт удалён" });
});

app.listen(PORT, () => {
    console.log(`✅ Сервер запущен на http://localhost:${PORT}`);
});
