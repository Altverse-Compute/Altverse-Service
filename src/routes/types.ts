export interface RegisterProps {
    username: string;
    password: string;
    token: string;
}

export interface LoginProps {
    username: string
    password: string
}

export interface AuthResponse {
    username: string;
    accessories: String[]
    highest: Object
    vp: number
    role: string
}

export interface ProfileProps {
    username: string
}

export type ServersResponse = Array<{
    name: string;
    icon: string;
    domain: string;
}>