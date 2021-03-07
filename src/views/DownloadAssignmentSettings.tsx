import * as React from 'react';
import { ComponentEx, More, selectors, types, util, Icon } from 'vortex-api';
import { Button, ControlLabel, FormGroup, HelpBlock, Table } from 'react-bootstrap';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { IDownloadAssignmentRule } from '../types';
import { addAutoAssignRule, deleteAutoAssignRule } from '../actions';

interface IConnectedProps {
    rules: IDownloadAssignmentRule[];
    games: types.IGameStored[];
    discovered: {[id: string]: types.IDiscoveryResult};
    gameName: (gameId: string) => string;
}

interface IActionProps {
    addRule: (rule: IDownloadAssignmentRule) => void;
    deleteRule: (rule: IDownloadAssignmentRule) => void;
}

type IProps = IConnectedProps & IActionProps;

interface IState {
    downloadFor?: string;
    assignGame?: string;
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

        return (
            <form>
                <FormGroup>
                    <ControlLabel>
                        {t('Download Game Assignments')}
                        <More id='more-downloadassigner' name={t('Download Game Assignment')}>
                            Help text here!
                        </More>
                    </ControlLabel>
                    <HelpBlock>
                        Additional help text.
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
                            {this.ruleList()}
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
                        </tbody>
                    </Table>
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
        const { addRule } = this.props;
        addRule({downloadFor, assignGame});
        this.nextState.assignGame = '';
        this.nextState.downloadFor = '';
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
        const listing =  rules.map(rule => {
            return (
                <tr>
                    <td>{gameName(rule.downloadFor)}</td>
                    <td>{gameName(rule.assignGame)}</td>
                    <td><Button onClick={() => deleteRule(rule)} title={t('Delete rule')}><Icon name='delete' /></Button></td>
                </tr>
            );
        });

        return (<>{listing}</>);

    }
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
    }
}

export default withTranslation(['download-game-assigner'])(connect(mapStateToProps, mapDispatchToProps)(DownloadAssignmentSettings));