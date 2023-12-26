export type TournamentStatusT = 'CANCELED' | 'PENDING' | 'FINISHED' | 'OPEN' | 'CLOSED' | 'POSTPONED'
export type CompetitionType = 'TOURNAMENT' | 'LEAGUE'

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
    status: TournamentStatusT
    league: string
}

export interface CompetitorsI {
    uid: string
    type: CompetitionType
    eventId: string
    created_at?: Date
}