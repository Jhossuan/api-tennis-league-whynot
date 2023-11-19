export type TournamentStatusT = 'CANCELED' | 'PENDING' | 'FINISHED' | 'OPEN' | 'CLOSED' | 'POSTPONED'

export interface TournamentI {
    tournament: string
    title: string
    description: string
    eventDate: Date
    location: string
    price: string
    minParticipants: number
    maxParticipants: number
    reward: string
    created_at?: Date
    imageUrl?: string
    status: TournamentStatusT[]
}

export interface CompetitorsI {
    uid: string
    tournament: string
    created_at?: Date
}