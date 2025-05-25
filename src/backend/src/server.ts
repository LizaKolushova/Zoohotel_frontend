import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { read, readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type {
    Animal,
    AnimalType,
    Client,
    Booking,
    Hotel,
    Organization,
    Pricing,
    Restriction,
    Vaccination,
    Treatment,
    MedicalRecord,
    AnimalPassport,
} from "@/types/types";

// Тип JSON файла
interface ZoohotelData {
    animals: Animal[];
    animal_types: AnimalType[];
    clients: Client[];
    hotels: Hotel[];
    bookings: Booking[];
    organizations: Organization[];
    hotel_pricing: Pricing[];
    hotel_restrictions: Restriction[];
    vaccinations: Vaccination[];
    treatments: Treatment[];
    medical_records: MedicalRecord[];
    animal_passports: AnimalPassport[];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;
const DATA_PATH = join(__dirname, "..", "data.json");

app.use(
    cors({
        origin: ["http://localhost:4173", "http://localhost:5173"], // или укажите точный адрес фронтенда, например: 'http://localhost:5173'
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

app.get("/hotels", (req: Request, res: Response) => {
    const data = readData();
    res.json(data.hotels || []);
});

app.get("/hotels/:id", (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const data = readData();
    const hotel = data.hotels?.find((hotel: Hotel) => hotel.id === id) || null;
    if (hotel) {
        res.json(hotel);
    } else {
        res.status(404).json({ message: "Запрашиваемый отель не существует" });
    }
});

app.get("/organizations", (req: Request, res: Response) => {
    const data = readData();
    res.json(data.organizations || []);
});

app.get("/restrictions", (req: Request, res: Response) => {
    const data = readData();
    res.json(data.hotel_restrictions || []);
});

app.get("/restrictions/:id", (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const data = readData();
    const restriction =
        data.hotel_restrictions?.find((r: Restriction) => r.id === id) || null;
    if (restriction) {
        res.json(restriction);
    } else {
        res.status(404).json({
            message: "Запрашиваемое ограничение не существует",
        });
    }
});

app.get("/bookings", (req: Request, res: Response) => {
    const data = readData();
    res.json(data.bookings || []);
});

app.get("/bookings/:id", (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const data = readData();
    const booking = data.bookings?.find((b: Booking) => b.id === id) || null;
    if (booking) {
        res.json(booking);
    } else {
        res.status(404).json({
            message: "Запрашиваемое бронирование не существует",
        });
    }
});

app.post("/bookings", (req: Request, res: Response) => {
    const {
        id,
        client_id,
        animal_id,
        hotel_id,
        pricing_id,
        start_date,
        end_date,
        status,
        total_price,
    }: Booking = req.body;
    const data = readData();
    const bookings = data.bookings || [];

    // Проверка доступности места в отеле
    const conflictingBookings = bookings.filter((booking: Booking) => {
        // Пропускаем текущее бронирование при редактировании
        if (id && booking.id === id) return false;

        // Пропускаем отмененные бронирования
        if (booking.status === "cancelled") return false;

        // Проверяем пересечение дат
        const startA = new Date(booking.start_date);
        const endA = new Date(booking.end_date);
        const startB = new Date(start_date);
        const endB = new Date(end_date);

        const dateOverlap = startA <= endB && startB <= endA;

        // Проверяем, что бронирование в том же отеле
        const sameHotel = booking.hotel_id === hotel_id;

        return dateOverlap && sameHotel;
    });

    // Получаем информацию о тарифе и ограничениях
    const pricing = data.hotel_pricing?.find(
        (p: Pricing) => p.id === pricing_id
    );
    if (!pricing) {
        return res
            .status(400)
            .json({ message: "Указанный тариф не существует" });
    }

    const restriction = data.hotel_restrictions?.find(
        (r: Restriction) => r.id === pricing.restriction_id
    );
    if (!restriction) {
        return res.status(400).json({
            message: "Нет информации об ограничениях для данного тарифа",
        });
    }

    // Проверяем тип животного
    animal_id.forEach((element) => {
        const animal = data.animals?.find((a: any) => a.id === element);
        if (!animal) {
            return res
                .status(400)
                .json({ message: "Указанное животное не существует" });
        }
        if (animal.animal_type_id !== restriction.animal_type_id) {
            return res.status(400).json({
                message: "Тип животного не соответствует ограничениям тарифа",
            });
        }
    });

    // Считаем количество животных этого типа в отеле в этот период
    const animalTypeBookings = conflictingBookings.filter(
        (booking: Booking) => {
            const bookedAnimal = data.animals?.find(
                (a: any) => a.id === booking.animal_id
            );
            return (
                bookedAnimal &&
                bookedAnimal.animal_type_id === restriction.animal_type_id
            );
        }
    );

    if (animalTypeBookings.length >= restriction.max_count) {
        return res.status(400).json({
            message: `Превышено максимальное количество животных данного типа (${restriction.max_count})`,
        });
    }

    if (id) {
        // Редактирование существующего бронирования
        const bookingIndex = bookings.findIndex((b: Booking) => b.id === id);
        if (bookingIndex === -1) {
            return res.status(404).json({ message: "Бронирование не найдено" });
        }

        bookings[bookingIndex] = {
            id,
            client_id,
            animal_id,
            hotel_id,
            pricing_id,
            start_date,
            end_date,
            status,
            total_price,
        };

        res.status(200).json({
            message: "Данные о бронировании успешно изменены",
        });
    } else {
        // Добавление нового бронирования
        const newId =
            bookings.length > 0 ? bookings[bookings.length - 1].id + 1 : 1;
        bookings.push({
            id: newId,
            client_id,
            animal_id,
            hotel_id,
            pricing_id,
            start_date,
            end_date,
            status: status || "pending", // По умолчанию "в ожидании"
            total_price,
        });

        res.status(201).json({
            message: "Добавлено новое бронирование",
            id: newId,
        });
    }

    data.bookings = bookings;
    writeData(data);
});

app.delete("/bookings/:id", (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const data = readData();

    if (!data.bookings || !data.bookings.some((b: Booking) => b.id === id)) {
        return res
            .status(404)
            .json({ message: "Бронирование с запрашиваемым id не найдено" });
    }

    // Удаляем бронирование
    data.bookings = data.bookings.filter((b: Booking) => b.id !== id);

    writeData(data);
    res.status(200).json({ message: "Бронирование успешно удалено" });
});

app.get("/clients", (req: Request, res: Response) => {
    res.json(readData().clients);
});

app.get("/pricing", (req: Request, res: Response) => {
    const data = readData();
    res.json(data.hotel_pricing || []);
});

app.get("/pricing/:id", (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const data = readData();
    const pricing =
        data.hotel_pricing?.find((price: Pricing) => price.id === id) || null;
    if (pricing) {
        res.json(pricing);
    } else {
        res.status(404).json({ message: "Запрашиваемый тариф не существует" });
    }
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
        res.status(200).json({
            message: "Данные о клиенте изменены",
            client_id: id,
        });
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
        res.status(200).json({
            message: "Добавлен новый клиент",
            client_id: appendingId,
        });
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
        res.status(200).json({
            message: "Данные о животном успешно изменены",
            animal_id: id,
        });
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
        res.status(200).json({
            message: "Добавлено новое животное",
            animal_id: appendingId,
        });
    }
    data.animals = animalData;
    writeData(data);
});

app.delete("/animals/:id", (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    deleteAnimal(id);
    res.status(200).json({ message: "Продукт удалён" });
});

// Эндпоинты для прививок
app.get("/vaccinations", (req: Request, res: Response) => {
    const data = readData();
    res.json(data.vaccinations || []);
});

app.get("/vaccinations/:id", (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const data = readData();
    const vaccination = data.vaccinations?.find((v) => v.id === id) || null;
    if (vaccination) {
        res.json(vaccination);
    } else {
        res.status(404).json({
            message: "Запрашиваемая прививка не существует",
        });
    }
});

app.get("/animals/:id/vaccinations", (req: Request, res: Response) => {
    const animalId = parseInt(req.params.id);
    const data = readData();

    // Проверяем существование животного
    const animal = data.animals?.find((a) => a.id === animalId);
    if (!animal) {
        return res
            .status(404)
            .json({ message: "Запрашиваемое животное не существует" });
    }

    const animalVaccinations =
        data.vaccinations?.filter((v) => v.animal_id === animalId) || [];
    res.json(animalVaccinations);
});

app.post("/vaccinations", (req: Request, res: Response) => {
    const { id, animal_id, vaccination_date, vaccination_name } = req.body;
    const data = readData();
    const vaccinationsData = data.vaccinations || [];

    // Проверка существования животного
    const animal = data.animals?.find((a) => a.id === animal_id);
    if (!animal) {
        return res
            .status(404)
            .json({ message: "Указанное животное не существует" });
    }

    if (id) {
        // Редактирование существующей прививки
        const vaccinationIndex = vaccinationsData.findIndex((v) => v.id === id);
        if (vaccinationIndex === -1) {
            return res.status(404).json({ message: "Прививка не найдена" });
        }

        vaccinationsData[vaccinationIndex] = {
            id,
            animal_id,
            vaccination_date,
            vaccination_name,
        };

        res.status(200).json({ message: "Данные о прививке успешно изменены" });
    } else {
        // Добавление новой прививки
        const newId =
            vaccinationsData.length > 0
                ? vaccinationsData[vaccinationsData.length - 1].id + 1
                : 1;

        vaccinationsData.push({
            id: newId,
            animal_id,
            vaccination_date,
            vaccination_name,
        });

        res.status(201).json({
            message: "Добавлена новая прививка",
            id: newId,
        });
    }

    data.vaccinations = vaccinationsData;
    writeData(data);
});

app.delete("/vaccinations/:id", (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const data = readData();

    if (!data.vaccinations || !data.vaccinations.some((v) => v.id === id)) {
        return res
            .status(404)
            .json({ message: "Прививка с запрашиваемым id не найдена" });
    }

    data.vaccinations = data.vaccinations.filter((v) => v.id !== id);
    writeData(data);
    res.status(200).json({ message: "Прививка успешно удалена" });
});

// Эндпоинты для обработок
app.get("/treatments", (req: Request, res: Response) => {
    const data = readData();
    res.json(data.treatments || []);
});

app.get("/treatments/:id", (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const data = readData();
    const treatment = data.treatments?.find((t) => t.id === id) || null;
    if (treatment) {
        res.json(treatment);
    } else {
        res.status(404).json({
            message: "Запрашиваемая обработка не существует",
        });
    }
});

app.get("/animals/:id/treatments", (req: Request, res: Response) => {
    const animalId = parseInt(req.params.id);
    const data = readData();

    // Проверяем существование животного
    const animal = data.animals?.find((a) => a.id === animalId);
    if (!animal) {
        return res
            .status(404)
            .json({ message: "Запрашиваемое животное не существует" });
    }

    const animalTreatments =
        data.treatments?.filter((t) => t.animal_id === animalId) || [];
    res.json(animalTreatments);
});

app.post("/treatments", (req: Request, res: Response) => {
    const { id, animal_id, treatment_date, treatment_type, description } =
        req.body;
    const data = readData();
    const treatmentsData = data.treatments || [];

    // Проверка существования животного
    const animal = data.animals?.find((a) => a.id === animal_id);
    if (!animal) {
        return res
            .status(404)
            .json({ message: "Указанное животное не существует" });
    }

    if (id) {
        // Редактирование существующей обработки
        const treatmentIndex = treatmentsData.findIndex((t) => t.id === id);
        if (treatmentIndex === -1) {
            return res.status(404).json({ message: "Обработка не найдена" });
        }

        treatmentsData[treatmentIndex] = {
            id,
            animal_id,
            treatment_date,
            treatment_type,
            description,
        };

        res.status(200).json({
            message: "Данные об обработке успешно изменены",
        });
    } else {
        // Добавление новой обработки
        const newId =
            treatmentsData.length > 0
                ? treatmentsData[treatmentsData.length - 1].id + 1
                : 1;

        treatmentsData.push({
            id: newId,
            animal_id,
            treatment_date,
            treatment_type,
            description,
        });

        res.status(201).json({
            message: "Добавлена новая обработка",
            id: newId,
        });
    }

    data.treatments = treatmentsData;
    writeData(data);
});

app.delete("/treatments/:id", (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const data = readData();

    if (!data.treatments || !data.treatments.some((t) => t.id === id)) {
        return res
            .status(404)
            .json({ message: "Обработка с запрашиваемым id не найдена" });
    }

    data.treatments = data.treatments.filter((t) => t.id !== id);
    writeData(data);
    res.status(200).json({ message: "Обработка успешно удалена" });
});

// Эндпоинты для медицинских записей
app.get("/medical_records", (req: Request, res: Response) => {
    const data = readData();
    res.json(data.medical_records || []);
});

app.get("/medical_records/:id", (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const data = readData();
    const medicalRecord =
        data.medical_records?.find((r) => r.id === id) || null;
    if (medicalRecord) {
        res.json(medicalRecord);
    } else {
        res.status(404).json({
            message: "Запрашиваемая медицинская запись не существует",
        });
    }
});

app.get("/animals/:id/medical_records", (req: Request, res: Response) => {
    const animalId = parseInt(req.params.id);
    const data = readData();

    // Проверяем существование животного
    const animal = data.animals?.find((a) => a.id === animalId);
    if (!animal) {
        return res
            .status(404)
            .json({ message: "Запрашиваемое животное не существует" });
    }

    const animalMedicalRecords =
        data.medical_records?.filter((r) => r.animal_id === animalId) || [];
    res.json(animalMedicalRecords);
});

app.post("/medical_records", (req: Request, res: Response) => {
    const {
        id,
        animal_id,
        system_user_id,
        date,
        diagnosis,
        treatment,
        prescriptions,
        notes,
    } = req.body;
    const data = readData();
    const medicalRecordsData = data.medical_records || [];

    // Проверка существования животного
    const animal = data.animals?.find((a) => a.id === animal_id);
    if (!animal) {
        return res
            .status(404)
            .json({ message: "Указанное животное не существует" });
    }

    if (id) {
        // Редактирование существующей медицинской записи
        const recordIndex = medicalRecordsData.findIndex((r) => r.id === id);
        if (recordIndex === -1) {
            return res
                .status(404)
                .json({ message: "Медицинская запись не найдена" });
        }

        medicalRecordsData[recordIndex] = {
            id,
            animal_id,
            system_user_id,
            date,
            diagnosis,
            treatment,
            prescriptions,
            notes,
        };

        res.status(200).json({
            message: "Данные медицинской записи успешно изменены",
        });
    } else {
        // Добавление новой медицинской записи
        const newId =
            medicalRecordsData.length > 0
                ? medicalRecordsData[medicalRecordsData.length - 1].id + 1
                : 1;

        medicalRecordsData.push({
            id: newId,
            animal_id,
            system_user_id,
            date,
            diagnosis,
            treatment,
            prescriptions,
            notes,
        });

        res.status(201).json({
            message: "Добавлена новая медицинская запись",
            id: newId,
        });
    }

    data.medical_records = medicalRecordsData;
    writeData(data);
});

app.delete("/medical_records/:id", (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const data = readData();

    if (
        !data.medical_records ||
        !data.medical_records.some((r) => r.id === id)
    ) {
        return res.status(404).json({
            message: "Медицинская запись с запрашиваемым id не найдена",
        });
    }

    data.medical_records = data.medical_records.filter((r) => r.id !== id);
    writeData(data);
    res.status(200).json({ message: "Медицинская запись успешно удалена" });
});

app.get("/animals/:id/medical_history", (req: Request, res: Response) => {
    const animalId = parseInt(req.params.id);
    const data = readData();

    // Проверяем существование животного
    const animal = data.animals?.find((a) => a.id === animalId);
    if (!animal) {
        return res
            .status(404)
            .json({ message: "Запрашиваемое животное не существует" });
    }

    // Получаем все данные для животного
    const vaccinations =
        data.vaccinations?.filter((v) => v.animal_id === animalId) || [];
    const treatments =
        data.treatments?.filter((t) => t.animal_id === animalId) || [];
    const medicalRecords =
        data.medical_records?.filter((r) => r.animal_id === animalId) || [];

    // Объединяем все в один объект
    const medicalHistory = {
        animal: {
            id: animal.id,
            name: animal.name,
            breed: animal.breed,
            birth_date: animal.birth_date,
        },
        vaccinations: vaccinations,
        treatments: treatments,
        medical_records: medicalRecords,
    };

    res.json(medicalHistory);
});

app.get("/animal_passports", (req: Request, res: Response) => {
    const data = readData();
    res.json(data.animal_passports || []);
});

app.get("/animal_passports/:id", (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const data = readData();
    const passport = data.animal_passports?.find((p) => p.id === id) || null;
    if (passport) {
        res.json(passport);
    } else {
        res.status(404).json({
            message: "Запрашиваемый паспорт не существует",
        });
    }
});

app.get("/animals/:id/passport", (req: Request, res: Response) => {
    const animalId = parseInt(req.params.id);
    const data = readData();

    // Проверяем существование животного
    const animal = data.animals?.find((a) => a.id === animalId);
    if (!animal) {
        return res
            .status(404)
            .json({ message: "Запрашиваемое животное не существует" });
    }

    const animalPassport =
        data.animal_passports?.find((p) => p.animal_id === animalId) || null;
    if (animalPassport) {
        res.json(animalPassport);
    } else {
        res.status(404).json({
            message: "Паспорт для данного животного не найден",
        });
    }
});

app.post("/animal_passports", (req: Request, res: Response) => {
    const {
        id,
        animal_id,
        last_vet_visit,
        vet_visit_reason,
        chronic_diseases,
        past_diseases,
        vet_contacts,
        health_features,
    } = req.body;

    const data = readData();
    const passportsData = data.animal_passports || [];

    // Проверка существования животного
    const animal = data.animals?.find((a) => a.id === animal_id);
    if (!animal) {
        return res
            .status(404)
            .json({ message: "Указанное животное не существует" });
    }

    if (id) {
        // Редактирование существующего паспорта
        const passportIndex = passportsData.findIndex((p) => p.id === id);
        if (passportIndex === -1) {
            return res.status(404).json({ message: "Паспорт не найден" });
        }

        passportsData[passportIndex] = {
            id,
            animal_id,
            last_vet_visit,
            vet_visit_reason,
            chronic_diseases,
            past_diseases,
            vet_contacts,
            health_features,
        };

        res.status(200).json({ message: "Данные паспорта успешно изменены" });
    } else {
        // Проверка на существующий паспорт для данного животного
        const existingPassport = passportsData.find(
            (p) => p.animal_id === animal_id
        );
        if (existingPassport) {
            return res.status(400).json({
                message: "Паспорт для данного животного уже существует",
                passport_id: existingPassport.id,
            });
        }

        // Добавление нового паспорта
        const newId =
            passportsData.length > 0
                ? passportsData[passportsData.length - 1].id + 1
                : 1;

        passportsData.push({
            id: newId,
            animal_id,
            last_vet_visit,
            vet_visit_reason,
            chronic_diseases,
            past_diseases,
            vet_contacts,
            health_features,
        });

        res.status(201).json({
            message: "Добавлен новый паспорт животного",
            id: newId,
        });
    }

    data.animal_passports = passportsData;
    writeData(data);
});

app.delete("/animal_passports/:id", (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const data = readData();

    if (
        !data.animal_passports ||
        !data.animal_passports.some((p) => p.id === id)
    ) {
        return res
            .status(404)
            .json({ message: "Паспорт с запрашиваемым id не найден" });
    }

    data.animal_passports = data.animal_passports.filter((p) => p.id !== id);
    writeData(data);
    res.status(200).json({ message: "Паспорт успешно удален" });
});

app.get("/pricings_with_periods", (req: Request, res: Response) => {
    const {
        hotel_pricing,
        hotel_restrictions,
        animal_types,
        animals,
        clients,
        bookings,
    } = JSON.parse(readFileSync(DATA_PATH, "utf8"));

    const result = hotel_pricing.map((pricing: Pricing) => {
        const restriction = hotel_restrictions.find(
            (r: Restriction) => r.id === pricing.restriction_id
        );
        const animalType = animal_types.find(
            (a: AnimalType) => a.id === restriction?.animal_type_id
        );

        const relatedBookings = bookings
            .filter((b: Booking) => b.pricing_id === pricing.id)
            .map((booking: Booking) => {
                const animalsInBooking: Animal[] = [];
                booking.animal_id.forEach((animal_id: number) => {
                    animalsInBooking.push(
                        animals.find((a: Animal) => a.id === animal_id)
                    );
                });

                const client = clients.find(
                    (c: Client) => c.id === booking.client_id
                );

                return {
                    id: booking.id,
                    start: booking.start_date,
                    end: booking.end_date,
                    price: booking.total_price,
                    animal: animalsInBooking.map((animal) => {
                        return { id: animal.id, name: animal.name };
                    }),
                    client: client
                        ? {
                              id: client.id,
                              name: `${client.last_name} ${client.first_name}`,
                              phone: client.phone,
                              email: client.email,
                          }
                        : null,
                };
            });

        return {
            id: pricing.id,
            name: pricing.name,
            restriction: animalType?.name || "Неизвестно",
            price: pricing.price,
            periods: relatedBookings,
        };
    });

    res.json(result);
});

app.listen(PORT, () => {
    console.log(`✅ Сервер запущен на http://localhost:${PORT}`);
});
