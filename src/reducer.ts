import * as actions from './actions';
import { types, util } from 'vortex-api';
const rules = require('./defaultrules.json');

const autoAssignerReducer: types.IReducerSpec = {
    reducers: {
        [actions.addAutoAssignRule as any]: (state, payload) => {
            const rules = util.getSafe(state, ['rules'], []);
            rules.push(payload);
            return util.setSafe(state, ['rules'], rules)
        },
        [actions.deleteAutoAssignRule as any]: 
            (state, payload) => {
                const rules = util.getSafe(state, ['rules'], []);
                console.log('Rules from state', rules, state);
                const newRules = rules.filter(r => r.assignGame !== payload.assignGame && r.downloadFor !== payload.downloadFor);
                return util.setSafe(state, ['rules'], newRules);
        },
    },
    defaults: {
        rules
    }
};

export { autoAssignerReducer };