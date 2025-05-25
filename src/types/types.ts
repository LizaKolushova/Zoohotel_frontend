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

interface Pricing {
    id: number;
    name: string;
    hotel_id: number;
    restriction_id: number;
    price: number;
}

interface Hotel {
    id: number;
    organization_id: number;
    name: string;
    address: string;
    phone: string;
}

interface Organization {
    id: number;
    name: string;
    email: string;
}

interface Restriction {
    id: number;
    hotel_id: number;
    animal_type_id: number;
    max_count: number;
}

interface Booking {
    id: number;
    client_id: number;
    animal_id: number[];
    hotel_id: number;
    pricing_id: number;
    start_date: string;
    end_date: string;
    status: string;
    total_price: number;
}

interface Vaccination {
    id: number;
    animal_id: number;
    vaccination_date: string;
    vaccination_name: string;
}

interface Treatment {
    id: number;
    animal_id: number;
    treatment_date: string;
    treatment_type: string;
    description: string;
}

interface MedicalRecord {
    id: number;
    animal_id: number;
    system_user_id: number;
    date: string;
    diagnosis: string;
    treatment: string;
    prescriptions: string;
    notes: string;
}

interface AnimalPassport {
    id: number;
    animal_id: number;
    last_vet_visit: string;
    vet_visit_reason: string;
    chronic_diseases: string;
    past_diseases: string;
    vet_contacts: string;
    health_features: string;
}

export type {
    Animal,
    AnimalType,
    Client,
    Pricing,
    Hotel,
    Organization,
    Restriction,
    Booking,
    Vaccination,
    Treatment,
    MedicalRecord,
    AnimalPassport,
};
