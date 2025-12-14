export interface ItemVariant {
    name: string;
    weight: string;
    kkal: string;
    cost: string;
}

export interface Product {
    id: number;
    sectionId: number;
    name: string;
    description: string;
    imageUrl: string;
    order: number;
    data: ItemVariant[];
    createdAt: string;
    updatedAt: string;
}

export interface Addon {
    name: string;
    imageUrl: string;
    cost: string; 
}

export interface SectionSchema {
    options: { name: string; addons: Addon[] }[]; 
}

;

export interface SectionData {
    name: string;
    slug: string;
    schema: SectionSchema;
    order?: number;
}

export interface MenuSection {
    id: number;
    name: string;
    slug: string;
    schema: SectionSchema;
    order: number;
    items: Product[];
    createdAt: string;
    updatedAt: string;
}
