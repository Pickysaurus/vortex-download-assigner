import * as React from 'react';
import { ComponentEx, More, selectors, types, util, Icon } from 'vortex-api';
import { Button, ControlLabel, FormGroup, HelpBlock, Table } from 'react-bootstrap';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { IDownloadAssignmentRule } from '../types';
import { addAutoAssignRule, deleteAutoAssignRule, resetAutoAssignRules } from '../actions';

interface IConnectedProps {
    rules: IDownloadAssignmentRule[];
    games: types.IGameStored[];
    discovered: {[id: string]: types.IDiscoveryResult};
    gameName: (gameId: string) => string;
}

interface IActionProps {
    addRule: (rule: IDownloadAssignmentRule) => void;
    deleteRule: (rule: IDownloadAssignmentRule) => void;
    resetToDefaults: () => void;
}

type IProps = IConnectedProps & IActionProps;

interface IState {
    downloadFor: string;
    assignGame: string;
}

class DownloadAssignmentSettings extends ComponentEx<IProps,IState> {
    constructor(props) {
        super(props);
        this.initState({
            downloadFor: '',
            assignGame: ''
        });
    }

    render() {
        const { t } = this.props;
        const { downloadFor, assignGame } = this.state;

        const recommendTitle: string = t('Use a set of recommended defaults based on the common combinations of games this feature would be useful for.');

        return (
            <form>
                <FormGroup>
                    <ControlLabel>
                        {t('Download Game Assignments')}
                        <More id='more-downloadassigner' name={t('Download Game Assignment')}>
                            {t(
                                'When Vortex adds a new download from Nexus Mods, these settings will be used to decide which games to assign as compatible to each archive.'
                                +'This will prevent Vortex from reminding you that the mod was intended for a different game during installation and ensure it correctly shows up '
                                +'in the downloads tab while your preferred game is active.'
                            )}
                        </More>
                    </ControlLabel>
                    <HelpBlock>
                        {t('Add a new row to automatically mark downloaded archives for the game in the first column as compatible with game in the second column.')}
                    </HelpBlock>
                    <Table>
                        <thead>
                            <tr>
                            <th>{t('Downloads for')}</th>
                            <th>{t('are compatible with')}</th>
                            <th>{t('Actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                <select className='form-control' value={downloadFor} onChange={this.handleDownloadFor.bind(this)}>
                                    <option value={''}>{t('Select game')}</option>
                                    {this.gameList(true)}
                                </select>
                                </td>
                                <td>
                                <select className='form-control' value={assignGame} onChange={this.handleAssignGame.bind(this)}>
                                    <option value={''}>{t('Select game')}</option>
                                    {this.gameList(false)}
                                </select>
                                </td>
                                <td>
                                <Button disabled={!downloadFor || !assignGame} title={t('Add new rule')} onClick={this.addNewRule.bind(this)}><Icon name='add' /></Button>
                                </td>
                            </tr>
                            {this.ruleList()}
                        </tbody>
                    </Table>
                    <Button title={recommendTitle} onClick={this.defaults.bind(this)}><Icon name='smart' /> {t('Use recommended')}</Button>
                </FormGroup>
            </form>
        )
    }

    handleDownloadFor(event) {
        const { assignGame } = this.state;
        let newValue = event.target.value;
        if (assignGame === newValue) newValue = undefined;
        this.nextState.downloadFor = newValue;
    }

    handleAssignGame(event) {
        const { downloadFor } = this.state;
        let newValue = event.target.value;
        if (downloadFor === newValue) newValue = undefined;
        this.nextState.assignGame = newValue;
    }

    addNewRule() {
        const { downloadFor, assignGame } = this.state;
        const { addRule, rules } = this.props;
        const existingRule = rules.find(r => r.assignGame === assignGame && r.downloadFor === downloadFor);
        if (!existingRule) addRule({downloadFor, assignGame });
        this.nextState.assignGame = '';
        this.nextState.downloadFor = '';
    }

    defaults() {
        const { resetToDefaults } = this.props;
        resetToDefaults();
    }

    gameList(primary: boolean): JSX.Element {
        // Primary bool declares if we're looking at the 'downloadFor' or 'assignGame' field for filtering. 
        const { downloadFor, assignGame } = this.state;
        const { games, gameName } = this.props;

        const filterValue = !primary ? downloadFor : assignGame;

        const filteredGames = games.filter(g => g.id !== filterValue)
            .sort((a,b) => gameName(a.id) < gameName(b.id) ? -1 : 1);

        const options = filteredGames.map(game => (<option value={game.id}>{gameName(game.id)}</option>));

        return (<>{options}</>);      
    }

    ruleList(): JSX.Element {
        const { t, rules, deleteRule, gameName } = this.props;
        const listing =  rules.sort(sortRulesByTime).map(rule => {
            const ruleAdded: string = (rule.timeAdded > 0) ? new Date(rule.timeAdded).toLocaleDateString() : t('by default');
            return (
                <tr title={t('Rule created {{ruleAdded}}', { replace: { ruleAdded } })}>
                    <td>{gameName(rule.downloadFor)}</td>
                    <td>{gameName(rule.assignGame)}</td>
                    <td><Button onClick={() => deleteRule(rule)} title={t('Delete rule')}><Icon name='delete' /></Button></td>
                </tr>
            );
        });

        return (<>{listing}</>);

    }
}

function sortRulesByTime(a: IDownloadAssignmentRule, b: IDownloadAssignmentRule) {
    return a.timeAdded > b.timeAdded ? 1 : -1;
}

function mapStateToProps(state: any): IConnectedProps {
    const rules : IDownloadAssignmentRule[] = util.getSafe(state, ['settings', 'downloadAssigner', 'rules'], []);
    const discovered: {[id: string]: types.IDiscoveryResult} = util.getSafe(state, ['settings', 'gameMode', 'discovered'], {});
    const games: types.IGameStored[] = selectors.knownGames(state);
    
    return {
        rules,
        discovered,
        games,
        gameName: (gameId: string) => selectors.gameName(state, gameId)
    }
}

function mapDispatchToProps(dispatch: any): IActionProps {
    return {
        addRule: (rule: IDownloadAssignmentRule): void => dispatch(addAutoAssignRule(rule.downloadFor, rule.assignGame)),
        deleteRule: (rule: IDownloadAssignmentRule): void => dispatch(deleteAutoAssignRule(rule.downloadFor, rule.assignGame)),
        resetToDefaults: (): void => dispatch(resetAutoAssignRules(undefined)),
    }
}

export default withTranslation(['download-game-assigner'])(connect(mapStateToProps, mapDispatchToProps)(DownloadAssignmentSettings));