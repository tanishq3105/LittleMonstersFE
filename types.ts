export interface Billboard {
    id: string;
    label: string;
    imageUrl: string;
}

export interface Category {
    id: string;
    name: string;
    billboard: Billboard;
}

export interface Product {
    id: string;
    category: Category;
    name: string;
    price: string;
    isFeatured: boolean;
    size: Size;
    age: Age;
    duration: Duration;
    destination: Destination;
    images: Image[]
}

// Cart item includes product and quantity
export interface CartItem {
    product: Product;
    quantity: number;
}

export interface Image {
    id: string;
    url: string;
}

export interface Size {
    id: string;
    name: string;
    value: string;
}
export interface Age extends Size { };
export interface Duration extends Size { };
export interface Destination extends Size { };
export interface Color {
    id: string;
    name: string;
    value: string;
}