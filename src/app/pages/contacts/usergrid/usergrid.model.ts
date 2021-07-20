export interface Role {
    id: number;
    name?: string;
    status: boolean;
    created_at: Date;
    updated_at: Date;
    email: string;
    permissions: permission[]
}

export interface permission {
    id: number;
    value: string;
    description: string;
    status: boolean;
    created_at: Date;
    updated_at: Date;
}