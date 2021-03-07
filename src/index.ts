import { actions, log, types, util } from 'vortex-api';
import { autoAssignerReducer } from './reducer';
import { IDownloadAssignmentRule, IDownloadWithID } from './types';

function main(context: types.IExtensionContext) {

  context.registerReducer(['settings', 'downloadAssigner'], autoAssignerReducer);

  context.registerSettings('Download', util.LazyComponent(() => require('./views/DownloadAssignmentSettings')), () => {}, () => true, 100)

  context.once(() => {
    context.api.onStateChange(['persistent', 'downloads', 'files'], 
      (prevDLs, newDLs) => updateGames(prevDLs, newDLs, context.api));
  });
  return true;
}

function updateGames(prevDLs: {[id: string]: types.IDownload}, newDLs: {[id: string]: types.IDownload}, api: types.IExtensionApi) {
  const prevIds = Object.keys(prevDLs);
  const newIds = Object.keys(newDLs);

  // Only run when there is a new download. 
  if (prevIds.length < newIds.length) {
      const found: IDownloadWithID[] = newIds.filter(dl => prevIds.indexOf(dl) === -1)
      .map(newDownload => ({id: newDownload, ...newDLs[newDownload]}));

      // Get the discovered game, as we won't assigning any downloads where the target game is not discovered.
      const state: types.IState = api.store.getState();
      const rules : IDownloadAssignmentRule[] = util.getSafe(state, ['settings', 'downloads', 'autoAssigner', 'rules'], []);
      const games: {[id: string]: types.IDiscoveredTool} = util.getSafe(state, ['settings', 'gameMode', 'discovered'], {});

      found.forEach((newDownload) => {
        // Filter to only process relevant rules, where the game array includes the "downloadFor" rule value.
        const filteredRules = rules.filter(r => !newDownload.game.includes(r.downloadFor));
        filteredRules.forEach((rule) => {
            // Ignore games that aren't currently discovered.
            if (!games[rule.assignGame]) return;

            // If the game doesn't already have assignGame, we will add it.
            if (newDownload.game.includes(rule.downloadFor) && !newDownload.game.includes(rule.assignGame)) {
                const newGames = [...newDownload.game];
                // Add the new game to the end of the array.
                newGames.push(rule.assignGame);
                log('info', 'Automatically assigning compatible game to download', { dl: newDownload.modInfo?.name || newDownload.id, game: rule.assignGame });
                api.store.dispatch(actions.setCompatibleGames(newDownload.id, newGames))
            }
        })
      })
      
  }
}

export default main;
