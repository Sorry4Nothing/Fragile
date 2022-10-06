import { FragileMission } from './fragilemission';

export interface FragileProject {
	id: number;
	projectName: string;
	missions: FragileMission[];
}
