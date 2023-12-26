export interface UserSchemaI {
    uid?: string
    name: string
    email: string
    password: string
    phone: string
    metadata?: MetadataI
    created_at?: Date
}

export interface MetadataI {
    userType: 'admin' | 'regular'
    code?: string
    repassword?: boolean
    expireIn?: any
    identity_verified: boolean,
    isBlocked?: boolean
}