import { types } from 'vortex-api';

export interface IDownloadWithID extends types.IDownload {
    id: string;
}

export interface IDownloadAssignmentRule {
    downloadFor: string;
    assignGame: string;
    timeAdded?: number;
}