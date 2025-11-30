export interface CartItem {
    cost: number;
    name: string;
    sectionId: number;
    description: string;
    imageUrl: string;
    count: number;
    variant: string;
    removedIngredients: string[];
    addons: string[];
    id?: string;
}
