import * as actions from './actions';
import { types, util } from 'vortex-api';
import { IDownloadAssignmentRule } from './types';

const defaultRules: IDownloadAssignmentRule[] = [
    {
        downloadFor: "enderal",
        assignGame: "skyrim",
        timeAdded: 0
    },
    {
        downloadFor: "enderalspecialedition",
        assignGame: "skyrimse",
        timeAdded: 1
    },
    {
        downloadFor: "skyrimse",
        assignGame: "skyrimvr",
        timeAdded: 3
    },
    {
        downloadFor: "fallout4",
        assignGame: "fallout4vr",
        timeAdded: 2
    }
];

const autoAssignerReducer: types.IReducerSpec = {
    reducers: {
        [actions.addAutoAssignRule as any]: (state, payload) => {
            const rules: IDownloadAssignmentRule[] = util.getSafe(state, ['rules'], []);
            rules.push(payload);
            return util.setSafe(state, ['rules'], rules);
        },
        [actions.deleteAutoAssignRule as any]: 
            (state, payload) => {
                const rules: IDownloadAssignmentRule[] = util.getSafe(state, ['rules'], []);
                const newRules = rules.filter(r => r.assignGame !== payload.assignGame && r.downloadFor !== payload.downloadFor);
                return util.setSafe(state, ['rules'], newRules);
        },
        [actions.resetAutoAssignRules as any]: 
            (state, payload) => util.setSafe(state, ['rules'], [...defaultRules]),
    },
    defaults: {
        rules: [...defaultRules]
    }
};

export { autoAssignerReducer };