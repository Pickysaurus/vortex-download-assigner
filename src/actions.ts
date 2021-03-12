import { createAction } from 'redux-act';

export const addAutoAssignRule = createAction('ADD_AUTOASSIGN_RULE', 
    (downloadFor: string, assignGame: string) => ({ downloadFor, assignGame, timeAdded: new Date().getTime() }));

export const deleteAutoAssignRule = createAction('DELETE_AUTOASSIGN_RULE',
    (downloadFor: string, assignGame: string) => ({ downloadFor, assignGame }));

export const resetAutoAssignRules = createAction('RESET_AUTOASSIGN_RULES',
    () => ({}));