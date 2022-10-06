export interface FragileMission {
    id: number;
    missionName: string;
    missionDescription: string;
    missionType: 'epic'|'story'|'task';
}