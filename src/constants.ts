export type Category = {
    id: number;
    name: string;
};

export const categories = [
    {
        id: 1,
        name: 'Laptop',
    },
    {
        id: 2,
        name: 'Phone',
    },
    {
        id: 3,
        name: 'Tablet',
    },
    {
        id: 4,
        name: 'Monitor',
    },
    {
        id: 5,
        name: 'UPS',
    },
    {
        id: 6,
        name: 'Camera',
    },
    {
        id: 7,
        name: 'Keyboard',
    },
    {
        id: 8,
        name: 'Processor',
    },
] as const satisfies readonly (Category)[];

export type CategoryName = typeof categories[number]['name'];

export const categoriesMap: Record<CategoryName, number> = categories.reduce((acc, category) => {
    acc[category.name] = category.id;
    return acc;
}, {} as Record<CategoryName, number>);
