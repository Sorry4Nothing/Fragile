import { FragileColumn } from './fragilecolumn';

export interface FragileProject {
	url: string;
	projectName: string;
	platform: 'githöb' | 'gitlab' | 'jira';
	columns: FragileColumn[];
}
